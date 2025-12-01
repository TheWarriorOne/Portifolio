// src/db.js
import { MongoClient, GridFSBucket } from "mongodb";

let client = null;
let db = null;

/**
 * Connect to MongoDB and return { client, db, gridfsBucket }.
 * Throws on failure.
 */
export async function connectDB(uri) {
  if (!uri) throw new Error("MONGO_URI not provided to connectDB");
  // reuse existing connection if present
  if (client && db) {
    return { client, db, gridfsBucket: new GridFSBucket(db) };
  }

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log("Mongo: conectando...");
    await client.connect();

    // se a URI tem /dbname, usa-o; senão usa default
    let dbName = null;
    try {
      const parsed = new URL(uri);
      if (parsed.pathname && parsed.pathname !== "/") dbName = parsed.pathname.replace(/^\//, "");
    } catch (e) {
      // ignore
    }

    db = dbName ? client.db(dbName) : client.db();
    console.log("Mongo: conectado. DB:", db.databaseName);

    const gridfsBucket = new GridFSBucket(db);
    return { client, db, gridfsBucket };
  } catch (err) {
    console.error("Erro ao conectar MongoDB:", err);
    try { await client.close(); } catch(e) {}
    client = null;
    db = null;
    throw err;
  }
}

export function getDb() {
  if (!db) throw new Error("Database not connected. Call connectDB first.");
  return db;
}
