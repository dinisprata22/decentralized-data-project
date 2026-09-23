import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";
const usersCollection = db.collection("users");

const router = express.Router();

/* OPEN GET return first 50 Users from users collection---------------------------*/
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        if (!page || !limit || page <= 0 || limit <= 0) {
            return res.status(400).json({
                mensagem: 'Parâmetros "page" e "limit" devem ser números positivos.'
            });
        }

        const totalUsers = await db.collection('users').countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        if (page > totalPages) {
            return res.status(404).json({
                mensagem: `Página ${page} não existe. Existem apenas ${totalPages} páginas.`
            });
        }

        const skip = (page - 1) * limit;

        const results = await db.collection('users')
            .find({})
            .skip(skip)
            .limit(limit)
            .toArray();

        res.status(200).json({
            currentPage: page,
            totalPages,
            firstPage: 1,
            lastPage: totalPages,
            resultsPerPage: limit,
            totalResults: totalUsers,
            users: results
        });
    } catch (error) {
        res.status(500).json({
            mensagem: 'Erro interno no servidor.',
            erro: error.message
        });
    }
});

/* CLOSE GET--------------------*/

/* OPEN POST add a user to the collection----------------*/
router.post('/', async (req, res) => {
    try {
        const document = req.body;
        let result;

        if (Array.isArray(document)) {
            result = await db.collection('users').insertMany(document);
        } else {
            result = await db.collection('users').insertOne(document);
        }
        res.status(201).json(result);
        console.log(document)
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao adicionar evento.', erro: error.message });
    }

});
/* CLOSE POST --------*/

/* GET id---------------------------*/

/* OPEN GET /users/:id → devolve o user e o top 3 eventos ----*/
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const numericId = parseInt(id);

        const user = await db.collection("users").findOne({
            $or: [{ _id: numericId }, { _id: id }]
        });

        if (!user) {
            return res.status(404).json({ mensagem: "Utilizador não encontrado." });
        }

        const reviews = user.eventReviews || [];
        if (reviews.length === 0) {
            return res.status(200).json({
                ...user,
                top3Events: [],
                mensagem: "O utilizador não tem reviews."
            });
        }

        const top3Reviews = reviews
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        const eventIds = top3Reviews.map(r => r.eventId);
        const events = await db.collection("events")
            .find({ id: { $in: eventIds } })
            .toArray();

        const top3Events = top3Reviews.map(r => {
            const event = events.find(e => e.id === r.eventId);
            return {
                ...r,
                eventInfo: event || null
            };
        });

        res.status(200).json({
            ...user,
            top3Events
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao obter utilizador.",
            erro: error.message
        });
    }
});
/* CLOSE GETid -------*/

/* OPEN Delete_User */
router.delete("/:id", async (req, res) => {

    try {
        let id = parseInt(req.params.id);

        let results = await db.collection('users').deleteOne({ _id: id });
        if (results.deletedCount == 0) {
            return res.status(404).json({
                mensagem: 'o id não se encontra no Data Base'
            });
        }
        /*------------------------------------------------- */
        res.status(200).json({
            mensagem: 'User Removido com sucesso'
        });
        /*------------------------------------------------- */

    } catch (error) {

        // Erro 500 – erro servidor
        res.status(500).json({
            mensagem: 'Erro interno no servidor.',
            erro: error.message
        });
    }
});
/* CLOSE Delete_User */


/* OPEN Update_User */
router.put("/:id", async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        const updatedata = req.body;
        let results = await db.collection('users').updateOne(
            { _id: id },
            { $set: updatedata }
        );
        if (results.matchedCount == 0) {
            res.status(404).json({
                mensagem: ' User não encontrado'
            })
        }
        res.status(200).json({
            mensagem: 'User atualizado'
        })

    } catch {
        // Erro 500 – erro servidor
        res.status(500).json({
            mensagem: 'Erro interno no servidor.',
            erro: error.message
        });
    }

})
/* CLOSE Update_User */

/* OPEN Add_newReview */
router.post('/:id/review/:event_id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const eventId = req.params.event_id;
    const { score } = req.body;
    if (!score || score < 1 || score > 5) {
        return res.status(400).json({
            message: "A pontuação deve estar entre 1 e 5"
        });
    }
    const review = {
        eventId: parseInt(eventId),
        date: new Date(),
        score: parseInt(score)

    };
    const filter = { _id: userId };
    const update = { $push: { eventReviews: review } };
    const result = await usersCollection.updateOne(filter, update);
    if (result.matchedCount === 0) {
        return res.status(404).json({
            message: "Usuário não encontrado porra"
        });
    }
    res.status(200).json({
        message: "Avaliação adicionada com sucesso"
    });
});
/* CLOSE Add_newReview */

/* OPEN UserReviews for event */
router.get('/reviews/:event_id', async (req, res) => {
  // Convert the event_id from string (params) to integer
  const eventId = parseInt(req.params.event_id);

  if (isNaN(eventId) || eventId <= 0) {
    return res.status(400).json({
      message: "ID de evento inválido."
    });
  }

  try {
    const pipeline = [
      { $match: { "eventReviews.eventId": eventId } },

      { $unwind: "$eventReviews" },

      { $match: { "eventReviews.eventId": eventId } },
      {
        $lookup: {
          from: "events",
          localField: "eventReviews.eventId",
          foreignField: "id",
          as: "eventDetails"
        }
      },
      { $unwind: "$eventDetails" },

      {
        $project: {
          _id: 0,
          userId: "$_id",
          userName: "$name",
          event: "$eventDetails.nome_atividade",
          score: "$eventReviews.score",
          date: "$eventReviews.date"
        }
      }
    ];

    const reviews = await usersCollection.aggregate(pipeline).toArray();

    if (reviews.length === 0) {
      return res.status(404).json({
        message: "Nenhuma avaliação encontrada para este evento."
      });
    }

    res.status(200).json(reviews);

  } catch (error) {
    console.error("MongoDB Aggregation Error:", error);
    res.status(500).json({ message: "Erro interno do servidor ao buscar avaliações." });
  }
});
/* CLOSE UserReviews for event */
export default router;