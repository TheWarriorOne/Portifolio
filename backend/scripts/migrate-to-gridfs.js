// backend/scripts/migrate-to-gridfs.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from '../src/db.js';

dotenv.config();

async function migrate() {
  const uploadsDir = path.join(process.cwd(), 'uploads'); // ajuste se necessário
  if (!fs.existsSync(uploadsDir)) {
    console.error('Pasta uploads não encontrada em:', uploadsDir);
    process.exit(1);
  }

  const { bucket } = await connectDB();

  const files = fs.readdirSync(uploadsDir).filter((f) => {
    const p = path.join(uploadsDir, f);
    return fs.lstatSync(p).isFile();
  });

  console.log('Arquivos encontrados para migrar:', files.length);

  for (const f of files) {
    const fullPath = path.join(uploadsDir, f);
    console.log('Migrando:', f);
    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(fullPath);
      const uploadStream = bucket.openUploadStream(f, {
        metadata: {
          migratedFromDisk: true,
          migratedAt: new Date(),
        },
      });

      readStream
        .pipe(uploadStream)
        .on('error', (err) => {
          console.error('Erro ao migrar', f, err);
          reject(err);
        })
        .on('finish', () => {
          // uploadStream.id contém o ObjectId do arquivo gravado no GridFS
          try {
            const id = uploadStream.id ? uploadStream.id.toString() : null;
            console.log('Migrado:', f, '-> id:', id);
            resolve({ filename: f, id });
          } catch (err) {
            reject(err);
          }
        });
    });
  }

  console.log('Migração completa.');
  process.exit(0);
}

migrate().catch((e) => {
  console.error('Falha na migração', e);
  process.exit(1);
});
