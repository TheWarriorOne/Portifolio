// backend/scripts/link-gridfs-ids.js
import dotenv from 'dotenv';
import { connectDB } from '../src/db.js';
import ImageModel from '../src/models/Image.js'; // ajuste o caminho se necessário

dotenv.config();

async function link() {
  const { db } = await connectDB();
  const bucketName = process.env.GRIDFS_BUCKET || 'uploads';
  const filesCol = db.collection(`${bucketName}.files`);

  console.log('Buscando documentos Image (coleção):', ImageModel.collection.name);
  const allDocs = await ImageModel.find({}).lean();

  let updated = 0;
  for (const doc of allDocs) {
    if (!Array.isArray(doc.imagens) || doc.imagens.length === 0) continue;

    const updates = [];

    for (const img of doc.imagens) {
      if (img.gridFsId) continue; // já vinculado
      const filename = img.name;
      if (!filename) continue;

      const fileDoc = await filesCol.findOne({ filename });
      if (fileDoc) {
        updates.push({
          updateOne: {
            filter: { _id: doc._id, 'imagens.name': filename },
            update: { $set: { 'imagens.$.gridFsId': fileDoc._id.toString() } },
          },
        });
      } else {
        console.warn(`Arquivo não encontrado no GridFS: ${filename} (doc ${doc._id})`);
      }
    }

    if (updates.length > 0) {
      const res = await ImageModel.bulkWrite(updates, { ordered: false });
      updated += updates.length;
      console.log(`Atualizado doc ${doc._id}: ${updates.length} imagens vinculadas`);
    }
  }

  console.log('Linkagem concluída. Total imagens atualizadas:', updated);
  process.exit(0);
}

link().catch((e) => {
  console.error('Erro na linkagem', e);
  process.exit(1);
});
