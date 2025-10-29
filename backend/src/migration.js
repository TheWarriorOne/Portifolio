// backend/src/migration.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

mongoose.connect(process.env.MONGO_URI);

async function migrateImages() {
  try {
    console.log('Iniciando migração...');
    // Aguarda a conexão estar pronta e verifica o estado
    await new Promise((resolve, reject) => {
      mongoose.connection.once('open', () => {
        console.log('Conexão com o MongoDB estabelecida!');
        resolve();
      });
      mongoose.connection.on('error', (err) => {
        console.error('Erro de conexão:', err);
        reject(err);
      });
    });

    const db = mongoose.connection.db;
    console.log('Listando todas as coleções...');
    const collections = await db.listCollections().toArray();
    console.log('Coleções disponíveis:', collections.map(c => c.name));

    console.log('Acessando coleção "images"...');
    const imagesCollection = db.collection('images');
    const images = await imagesCollection.find().toArray();
    console.log(`Total de documentos na coleção 'images': ${images.length}`);

    if (images.length === 0) {
      console.log('Aviso: Nenhum documento encontrado. Verifique o nome da coleção ou a conexão.');
    }

    let migratedCount = 0;
    for (const img of images) {
      console.log(`Processando documento com _id: ${img._id}, ID: ${img.id}`);
      if (img.imagens && Array.isArray(img.imagens)) {
        const isOldFormat = img.imagens.some(item => typeof item === 'string');
        if (isOldFormat) {
          const migratedImagens = img.imagens.map(name => ({
            name,
            approved: false,
            rejected: false
          }));
          await imagesCollection.updateOne(
            { _id: img._id },
            { $set: { imagens: migratedImagens } }
          );
          console.log(`✓ Migrado documento com _id: ${img._id}, ID: ${img.id} - ${img.imagens.length} imagens convertidas.`);
          migratedCount++;
        } else {
          console.log(`- Documento com _id: ${img._id}, ID: ${img.id} já está no formato correto.`);
        }
      } else {
        console.log(`- Documento com _id: ${img._id}, ID: ${img.id} sem imagens ou formato inválido.`);
      }
    }

    console.log(`\nMigração concluída! ${migratedCount} documentos migrados.`);
  } catch (err) {
    console.error('Erro durante a migração:', err);
  } finally {
    mongoose.connection.close();
  }
}

migrateImages().catch(console.error);