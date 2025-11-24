// backend/src/db.js
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let connected = false;
let bucket = null;

/**
 * Obtém a URI do ambiente (aceita múltiplos nomes comuns).
 */
function getMongoUri() {
  return (
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.DB_URI ||
    null
  );
}

/**
 * Conecta o Mongoose (singleton) e cria um GridFSBucket que pode ser usado
 * por rotas de upload/download.
 *
 * Retorna um objeto { db, bucket } onde:
 *  - db: referência ao db (mongoose.connection.db)
 *  - bucket: GridFSBucket do driver mongodb
 */
export const connectDB = async () => {
  if (connected && mongoose.connection?.readyState === 1) {
    return { db: mongoose.connection.db, bucket };
  }

  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      'MongoDB URI não encontrada. Defina MONGO_URI / MONGODB_URI / MONGO_URL no .env'
    );
  }

  try {
    // Conecta o mongoose — dbName opcional
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DBNAME || 'portifolio',
      // opções antigas são ignoradas pelas versões mais novas, mantemos por compatibilidade
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // pega a instância do driver nativo
    const db = mongoose.connection.db;

    // Criar GridFSBucket apenas se ainda não existir
    if (!bucket) {
      // GridFSBucket vem do pacote 'mongodb' (certifique-se que 'mongodb' está instalado)
      bucket = new GridFSBucket(db, {
        bucketName: process.env.GRIDFS_BUCKET || 'uploads',
      });
    }

    connected = true;
    console.log('✅ MongoDB conectado (mongoose) e GridFSBucket pronto');
    return { db, bucket };
  } catch (err) {
    console.error('❌ Erro ao conectar MongoDB:', err.message || err);
    throw err;
  }
};

/**
 * Helper para acessar o bucket após connectDB()
 */
export const getBucket = () => {
  if (!bucket) throw new Error('GridFSBucket não inicializado. Chame connectDB() primeiro.');
  return bucket;
};
