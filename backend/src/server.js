// src/server.js
import 'dotenv/config';
import { app } from './index.js'; // IMPORT NAMED (correção)
import { connectDB } from './db.js';
import mongoose from 'mongoose';

(async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI não definido. Configure a variável de ambiente MONGO_URI');
    }

    // Conectar Mongoose (usado pelos models)
    // Ajuste options conforme sua versão do mongoose
    console.log('Mongoose: conectando com', MONGO_URI);
    await mongoose.connect(MONGO_URI, {
      // opções recomendadas; remova/ajuste se versão diferente
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Mongoose: conectado. DB:', mongoose.connection.name);

    // Conectar MongoClient (usado por db.js / GridFS)
    // connectDB também tentará usar process.env.MONGO_URI se não receber arg
    console.log('MongoClient: conectando via connectDB...');
    await connectDB(MONGO_URI);
    console.log('MongoClient conectado via connectDB');

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
