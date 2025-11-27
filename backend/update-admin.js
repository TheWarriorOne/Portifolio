// update-admin.js (ES module)
import { MongoClient } from "mongodb";

const uri = process.argv[2];
const username = process.argv[3] || "admin";
const newHash = process.argv[4];

if (!uri || !newHash) {
  console.error("Uso: node update-admin.js \"<MONGO_URI>\" \"admin\" \"<novoHash>\"");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(); // usa o database do connection string
    const users = db.collection("users");

    const result = await users.updateOne(
      { username },
      { $set: { password: newHash } }
    );

    console.log("✓ matchedCount:", result.matchedCount);
    console.log("✓ modifiedCount:", result.modifiedCount);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    process.exit(2);
  } finally {
    await client.close();
  }
}

run();
