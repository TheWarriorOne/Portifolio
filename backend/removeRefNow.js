// backend/removeRefNow.js
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI;
const gridId = '692398bb7d6cdef7ecccdcb1';
const filename = '1763854994010-Batedeira_Mondial2.jpg'; // ajuste se quiser

(async () => {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(process.env.MONGO_DBNAME || 'portifolio');

    // remove por gridFsId (string) e por name
    const res = await db.collection('images').updateMany(
      {},
      { $pull: { imagens: { $or: [{ gridFsId: gridId }, { name: filename }] } } }
    );

    console.log('documents modified:', res.modifiedCount);
    await client.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
