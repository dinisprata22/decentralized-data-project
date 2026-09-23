import express from 'express'
//import movies from "./routes/movies.js";
import users from "./routes/users.js";
import eventsRouter from "./routes/events.js"; // importa a rota
import cors from "cors";
const app = express()
const port = 3000
app.use(express.json());
app.use(cors());
// Load the /movies routes
//app.use("/movies", movies);
// Load the /users routes
app.use("/users", users);
// Load the /events routes
app.use("/events", eventsRouter); // tudo que começar por /events vai para esse ficheiro
app.listen(port, () => {
 console.log(`backend listening on port ${port}`)
})
