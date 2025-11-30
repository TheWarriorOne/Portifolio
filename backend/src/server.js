// backend/src/server.js
import { connectDB } from './db.js';
import { app } from './index.js';

const port = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    console.log('MongoDB conectado!');
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
})();
