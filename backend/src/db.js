// src/db.js
import { MongoClient, GridFSBucket } from "mongodb";

let client = null;
let db = null;
let defaultGridfsBucketName = process.env.GRIDFS_BUCKET || "uploads";

/**
 * connectDB(uri?)
 * - uri: opcional. se não fornecido usa process.env.MONGO_URI
 * - retorna { client, db, gridfsBucket }
 */
export async function connectDB(uri) {
  const MONGO_URI = uri || process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error("MONGO_URI not provided to connectDB");

  // reuse existing connection
  if (client && db) {
    return { client, db, gridfsBucket: new GridFSBucket(db, { bucketName: defaultGridfsBucketName }) };
  }

  client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log("Mongo: conectando...");
    await client.connect();

    // tenta pegar db da URI (/dbname) ou usa client.db() (vai usar default do URI ou servidor)
    let dbName = null;
    try {
      const parsed = new URL(MONGO_URI);
      if (parsed.pathname && parsed.pathname !== "/") dbName = parsed.pathname.replace(/^\//, "");
    } catch (e) {
      // ignora parse se não for URL padrão
    }

    db = dbName ? client.db(dbName) : client.db();
    console.log("Mongo: conectado. DB:", db.databaseName);

    const gridfsBucket = new GridFSBucket(db, { bucketName: defaultGridfsBucketName });
    return { client, db, gridfsBucket };
  } catch (err) {
    console.error("Erro ao conectar MongoDB:", err);
    try { await client.close(); } catch (e) { /* noop */ }
    client = null;
    db = null;
    throw err;
  }
}

/** retorna instância do db (lança se não conectado) */
export function getDb() {
  if (!db) throw new Error("Database not connected. Call connectDB first.");
  return db;
}

/**
 * getBucket(bucketName?)
 * - retorna GridFSBucket conectado ao db
 */
export function getBucket(bucketName) {
  if (!db) throw new Error("Database not connected. Call connectDB first.");
  const name = bucketName || process.env.GRIDFS_BUCKET || defaultGridfsBucketName;
  return new GridFSBucket(db, { bucketName: name });
}

/** fecha conexão (útil em testes) */
export async function closeDB() {
  if (client) {
    try { await client.close(); } catch (e) {}
    client = null;
    db = null;
  }
}
