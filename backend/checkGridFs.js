import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI não definido no .env");
  process.exit(1);
}

const id = "6922612546372b75d515f277"; // ID que você quer testar

(async () => {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(process.env.MONGO_DBNAME || 'portifolio');
    const bucket = process.env.GRIDFS_BUCKET || 'uploads';

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    const fileDoc = await db.collection(`${bucket}.files`).findOne(query);

    console.log("Resultado GridFS:");
    console.log(fileDoc);

    await client.close();
  } catch (err) {
    console.error("Erro:", err);
  }
})();

