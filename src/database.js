require("dotenv").config();
const { MongoClient } = require("mongodb");

let db;
console.log("DB_URI:", process.env.DB_URI);

async function connectDB() {
  const client = new MongoClient(process.env.DB_URI);
  await client.connect();
  db = client.db();
  console.log("connected to MongoDB");
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };
