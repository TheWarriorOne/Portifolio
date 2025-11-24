// backend/checkByFilename.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI não definido no .env");
  process.exit(1);
}

const filename = "1763854994010-Batedeira_Mondial2.jpg"; // troque se quiser testar outro

(async () => {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(process.env.MONGO_DBNAME || 'portifolio');
    const bucket = process.env.GRIDFS_BUCKET || 'uploads';

    const fileDoc = await db.collection(`${bucket}.files`).findOne({ filename });
    console.log("Resultado buscando por filename:", fileDoc);

    // Também procure por filenames parecidos (fuzzy startsWith)
    const regex = new RegExp(filename.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const many = await db.collection(`${bucket}.files`)
      .find({ filename: { $regex: regex }})
      .limit(10)
      .toArray();
    console.log("Matches parecidos (limit 10):", many);

    await client.close();
  } catch (err) {
    console.error("Erro:", err);
    process.exit(1);
  }
})();
