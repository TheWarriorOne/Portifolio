// src/server.js
import 'dotenv/config';
import { app } from './index.js'; // IMPORT NAMED (correção)
import { connectDB } from './db.js';

(async () => {
  try {
    // conecta ao Mongo — (connectDB usa process.env.MONGO_URI se não passar arg)
    await connectDB(process.env.MONGO_URI);
    console.log('MongoDB conectado via server.js');

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
})();
