// backend/checkRef.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const gridId = '692398bb7d6cdef7ecccdcb1';
const filename = '1763854994010-Batedeira_Mondial2.jpg'; // ajuste se quiser checar por nome

(async () => {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(process.env.MONGO_DBNAME || 'portifolio');

    const byGrid = await db.collection('images').find({ 'imagens.gridFsId': gridId }).toArray();
    const byName = await db.collection('images').find({ 'imagens.name': filename }).toArray();

    console.log('Encontrados por gridFsId:', byGrid.length);
    byGrid.forEach(d => console.log(d.id, d._id.toString()));
    console.log('Encontrados por filename:', byName.length);
    byName.forEach(d => console.log(d.id, d._id.toString()));

    await client.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

