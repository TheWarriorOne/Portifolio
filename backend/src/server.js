// src/server.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './index.js';
import { connectDB } from './db.js';

(async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error(
        'MONGO_URI não definido. Configure a variável de ambiente MONGO_URI',
      );
    }

    // Conexão do Mongoose (models)
    console.log('Mongoose: conectando em', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log(
      'Mongoose: conectado. DB:',
      mongoose.connection.name,
    );

    // Conexão do MongoClient (GridFS / operações diretas) via db.js
    console.log('MongoClient: conectando via connectDB...');
    await connectDB(MONGO_URI);
    console.log('MongoClient conectado via connectDB');

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error(
      'Erro ao iniciar servidor:',
      err && err.stack ? err.stack : err,
    );
    process.exit(1);
  }
})();
