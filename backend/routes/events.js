import express from "express";
import db from "../db/config.js";
const router = express.Router();

/* OPEN getEvents */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);


    if (!page || !limit || page <= 0 || limit <= 0) {
      return res.status(400).json({
        mensagem: 'Parâmetros "page" e "limit" devem ser números positivos.'
      });
    }

    const totalEventos = await db.collection('events').countDocuments();


    const totalPages = Math.ceil(totalEventos / limit);

    if (page > totalPages) {
      return res.status(404).json({
        mensagem: `Página ${page} não existe. Existem apenas ${totalPages} páginas.`
      });
    }

    const skip = (page - 1) * limit;

    const eventos = await db.collection('events')
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();


    res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      firstPage: 1,
      lastPage: totalPages,
      resultsPerPage: limit,
      totalResults: totalEventos,
      eventos: eventos
    });

  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro interno no servidor.',
      erro: error.message
    });
  }
});
/* CLOSE GET--------------------*/

/* OPEN POST events --------*/
router.post('/', async (req, res) => {
  try {
    const document = req.body;
    let result;

    if (Array.isArray(document)) {
      result = await db.collection('events').insertMany(document);
    } else {
      result = await db.collection('events').insertOne(document);
    }
    res.status(201).json(result);
    console.log(document)
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao adicionar evento.', erro: error.message });
  }

});
/* CLOSE POST --------*/

/* OPEN GET /events/:id → devolve o evento e a média de score----*/
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const numericId = parseInt(id);


    const event = await db.collection("events").findOne({
      $or: [{ id: numericId }, { id: id }]
    });

    if (!event) {
      return res.status(404).json({ mensagem: "Evento não encontrado." });
    }


    const users = await db.collection("users").find({
      "eventReviews.eventId": numericId
    }).toArray();


    const allScores = users.flatMap(u =>
      u.eventReviews
        .filter(r => r.eventId === numericId)
        .map(r => r.score)
    );


    const avgScore = allScores.length
      ? allScores.reduce((acc, s) => acc + s, 0) / allScores.length
      : null;


    res.status(200).json({
      ...event,
      averageScore: avgScore
    });

  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao obter evento.",
      erro: error.message
    });
  }
});

/* CLOSE GETid -------*/

/* OPEN Delete Event*/
router.delete("/:id", async (req, res) => {
  try {
    let id = parseInt(req.params.id);

    let results = await db.collection('events').deleteOne({ id: id })
    if (results.deletedCount == 0)
      return res.status(404).json({
        mensagem: 'o id não se encontra no Data Base'
      });
    res.status(200).json({
      mensagem: 'Event Removido com sucesso'
    });

  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro interno no servidor.',
      erro: error.message
    });
  }
});
/*CLOSE Delete Event*/

/*OPEN Update Event*/
router.put("/:id", async (req, res) => {
  try {
    let id = parseInt(req.params.id);
    const updatedata = req.body;
    let results = await db.collection('events').updateOne(
      { id: id },
      { set: updatedata }
    );
    if (results.matchedCount == 0) {
      res.status(404).json({
        mensagem: ' Evento não encontrado'
      })
    }
    res.status(200).json({
      mensagem: 'Evento atualizado'
    })
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro interno no servidor.',
      erro: error.message
    });
  }
});
/*CLOSE Update Event*/

/* OPEN GET listaEventos com maior score */
router.get('/top/:limit', async (req, res) => {
  const limit = parseInt(req.params.limit);
  const usersCollection = db.collection("users");

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({
      message: "O limite tem que ser um numero positivo"
    });
  }
  try {
    const pipeline = [
      { $unwind: "$eventReviews" },
      {
        $group: {
          _id: "$eventReviews.eventId",
          averageScore: { $avg: "$eventReviews.score" }
        }
      },
      { $sort: { averageScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "id",
          as: "eventDetails"
        }
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          _id: 0,
          Evento: "$eventDetails",
          averageScore: 1
        }
      }
    ];
    const topEvents = await usersCollection.aggregate(pipeline).toArray();
    res.status(200).json(topEvents);
  } catch (error) {
    console.error("Erro ao pesquisar eventos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
/* CLOSE GET listaEventos com maior score*/

/* OPEN GET listEvents por ordem de nº totais de reviews */
router.get('/ratings/:order', async (req, res) => {
  const order = req.params.order.toLowerCase();
  let sortOrder;

  if (order === 'asc') {
    sortOrder = 1;
  } else if (order === 'desc') {
    sortOrder = -1;
  } else {
    return res.status(400).json({
      message: "Ordem invalida. Use 'asc' ou 'desc'."
    });
  }
  try {
    const pipeline = [
      { $unwind: "$eventReviews" },
      {
        $group: {
          _id: "$eventReviews.eventId",
          ReviewsTotais: { $count: {} }
        }
      },
      { $sort: { ReviewsTotais: sortOrder } },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "id",
          as: "eventDetails"
        }
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          _id: 0,
          Evento: "$eventDetails",
          ReviewsTotais: 1
        }
      }
    ];
    const ratingsEvents = await usersCollection.aggregate(pipeline).toArray();
    res.status(200).json(ratingsEvents);
  } catch (error) {
    console.error("Erro ao pesquisar eventos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
/* CLOSE GET listEvents por ordem de nº totais de reviews */

/* OPEN listOf5stars Events */
router.get('/star', async (req, res) => {

  try {
    const pipeline = [
      { $unwind: "$eventReviews" },
      { $match: { "eventReviews.score": 5 } },
      {
        $group: {
          _id: "$eventReviews.eventId",
          Total5star: { $count: {} }
        }
      },
      { $sort: { Total5star: -1 } },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "id",
          as: "eventDetails"
        }
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          _id: 0,
          Evento: "$eventDetails",
          Total5star: 1
        }
      }
    ];
    const starEvents = await usersCollection.aggregate(pipeline).toArray();
    res.status(200).json(starEvents);
  } catch (error) {
    console.error("Erro ao pesquisar eventos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
/* CLOSE listOf5stars Events */

/* OPEN listOfEvents per year */
router.get('/year/:year', async (req, res) => { // ADICIONEI /year, pois senão o postman faz confusão com o star
  const year = parseInt(req.params.year);
  if (isNaN(year) || year < 1900 || year > 2100) {
    return res.status(400).json({
      message: "Ano invalido. Forneca um ano entre 1900 e 2100."
    });
  }
  try {
    const pipeline = [
      { $unwind: "$eventReviews" },
      {
        $match: {
          $expr: { $eq: [{ $year: { $toDate: "$eventReviews.date" } }, year] }
        }
      },
      {
        $group: {
          _id: "$eventReviews.eventId"
        }
      },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "id",
          as: "eventDetails"
        }
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          _id: 0,
          Evento: "$eventDetails",
        }
      }
    ];
    const yearEvents = await usersCollection.aggregate(pipeline).toArray();
    res.status(200).json(yearEvents);
  } catch (error) {
    console.error("Erro ao pesquisar eventos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
/* CLOSE lisfOfEvents per year */

/* ENDPOINTS LIVRES */

/* OPEN Moda por evento */
router.get("/mode/:eventId", async (req, res) => {
  try {
    const usersCollection = db.collection("users");
    const eventId = parseInt(req.params.eventId);

    if (isNaN(eventId)) {
      return res.status(400).json({ mensagem: "O eventId deve ser um número." });
    }

    const pipeline = [
      { $unwind: "$eventReviews" },
      { $match: { "eventReviews.eventId": eventId } },
      {
        $group: {
          _id: "$eventReviews.score",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          eventId: eventId,
          mode: "$_id",
          count: 1
        }
      }
    ];

    const result = await usersCollection.aggregate(pipeline).toArray();

    if (result.length === 0) {
      return res.status(404).json({
        mensagem: "Este evento não tem reviews ou não existe."
      });
    }

    res.status(200).json(result[0]);

  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao calcular a moda.",
      erro: error.message
    });
  }
});
/* CLOSE Moda por evento */

/* OPEN Eventos grátis */
router.get("/free/list", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
      return res.status(400).json({
        mensagem: 'Parâmetros "page" e "limit" devem ser números positivos.'
      });
    }

    const eventsCollection = db.collection("events");

    const filter = {
      $or: [
        { custo: "" },
        { custo: { $regex: "gratuito", $options: "i" } }
      ]
    };

    const totalResults = await eventsCollection.countDocuments(filter);

    if (totalResults === 0) {
      return res.status(404).json({
        mensagem: "Não foram encontrados eventos gratuitos."
      });
    }
    const totalPages = Math.ceil(totalResults / limit);

    if (page > totalPages) {
      return res.status(404).json({
        mensagem: `Página ${page} não existe. Existem apenas ${totalPages} páginas.`
      });
    }
    const skip = (page - 1) * limit;


    const results = await eventsCollection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      firstPage: 1,
      lastPage: totalPages,
      resultsPerPage: limit,
      totalResults: totalResults,
      events: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensagem: "Erro interno no servidor.",
      erro: error.message
    });
  }
});

/* CLOSE Eventos grátis */

/* OPEN Próximos Eventos */
router.get("/soon/list", async (req, res) => {
  try {
    // número de dias entre 1 e 90. Se não existir, usa 7.
    const days = Math.min(Math.max(parseInt(req.query.days || "7", 10), 1), 90);

    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + days);

    const toISO = (d) => d.toISOString().slice(0, 10);
    const StrToday = toISO(today);
    const StrEnd = toISO(end);

    const query = {
      data_inicio: { $lte: StrEnd },
      data_fim: { $gte: StrToday }
    };

    let results = await db
      .collection("events")
      .find(query)
      .sort({ data_inicio: 1 })
      .toArray();

    if (results.length === 0) {
      return res.status(404).json({
        mensagem: `Não há eventos nos próximos ${days} dias`
      });
    }
    return res.status(200).json(results);

  } catch (error) {
    res.status(500).json({
      mensagem: "Erro interno no servidor.",
      erro: error.message
    });
  }
});
/* CLOSE Próximos Eventos */
export default router;
