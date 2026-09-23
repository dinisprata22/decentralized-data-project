import { MongoClient } from "mongodb";
const connectionString = "mongodb+srv://Almeidzzz:Manel2004!@cluster0.nxy1iyc.mongodb.net/";
const client = new MongoClient(connectionString);
let conn;
try {
 conn = await client.connect();
} catch(e) {
 console.error(e);
}
let db = conn.db("ADADProject");
export default db;
