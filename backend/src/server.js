// src/server.js
import express from "express";
import { connectDB } from "./db.js";

const app = express();

app.get("/api/health", (req, res) => res.status(200).json({ ok: true }));

(async () => {
  try {
    const { db, gridfsBucket } = await connectDB(process.env.MONGO_URI);
    // injete db/gridfsBucket no seu app se necessário (ex: app.locals.db = db)
    app.locals.db = db;
    app.locals.gridfs = gridfsBucket;

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  }
})();
