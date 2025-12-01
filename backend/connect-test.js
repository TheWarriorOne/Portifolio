// connect-test.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI not provided");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    // tenta extrair db name da URI (se houver)
    let dbName;
    try {
      const parsed = new URL(uri);
      dbName = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.replace(/^\//, "") : null;
    } catch (e) {
      dbName = null;
    }
    const db = dbName ? client.db(dbName) : client.db();
    console.log("Connected. Using DB:", db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    await client.close();
    console.log("OK");
  } catch (err) {
    console.error("Connection error:", err);
    process.exit(2);
  }
}

run();
