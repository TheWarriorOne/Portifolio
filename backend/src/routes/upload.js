// backend/src/routes/upload.js
import express from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import { ObjectId } from 'mongodb';
import { connectDB } from '../db.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// Helper: busca arquivo por filename ou id
async function findFile(db, identifier) {
  const bucketName = process.env.GRIDFS_BUCKET || 'uploads';
  const filesCol = db.collection(`${bucketName}.files`);
  // se for ObjectId
  if (ObjectId.isValid(identifier)) {
    const id = new ObjectId(identifier);
    return filesCol.findOne({ _id: id });
  }
  // senão busca por filename
  return filesCol.findOne({ filename: identifier });
}

/**
 * POST /api/upload
 * Body: multipart/form-data (field `file`)
 * Retorna: { fileId, filename, uploadDate, length }
 */
const { Readable } = require('stream');

router.post('/api/uploads', upload.array('images', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {
    const { bucket } = await connectDB();

    const results = [];

    for (const file of req.files) {
      const readable = Readable.from(file.buffer);

      const uploadStream = bucket.openUploadStream(file.originalname, {
        metadata: {
          mimeType: file.mimetype,
          uploadedAt: new Date(),
        },
      });

      await new Promise((resolve, reject) => {
        readable
          .pipe(uploadStream)
          .on('error', (err) => {
            console.error('GridFS upload error (file):', file.originalname, err);
            reject(err);
          })
          .on('finish', () => {
            resolve();
          });
      });

      results.push({
        fileId: uploadStream.id ? uploadStream.id.toString() : null,
        filename: file.originalname,
        length: uploadStream.length || undefined,
        uploadDate: new Date(),
      });
    }

    return res.status(201).json({ uploaded: results });
  } catch (err) {
    console.error('GridFS upload error (route):', err);
    return res.status(500).json({ error: 'Erro ao enviar arquivos' });
  }
});

/**
 * GET /api/images
 * Query: ?limit=100 (opcional)
 * Lista metadados de arquivos.
 */
router.get('/images', async (req, res) => {
  try {
    const { db } = await connectDB();
    const bucketName = process.env.GRIDFS_BUCKET || 'uploads';
    const limit = Math.min(1000, parseInt(req.query.limit || '200', 10));
    const files = await db.collection(`${bucketName}.files`)
      .find({})
      .sort({ uploadDate: -1 })
      .limit(limit)
      .toArray();
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

/**
 * GET /api/uploads/:identifier
 * identifier = filename OR fileId (ObjectId string).
 * Faz streaming do arquivo para o cliente.
 */
router.get('/api/uploads/:identifier', async (req, res) => {
  try {
    const { bucket, db } = await connectDB();
    const identifier = req.params.identifier;
    const fileDoc = await findFile(db, identifier);
    if (!fileDoc) return res.status(404).json({ error: 'Arquivo não encontrado' });

    const contentType = fileDoc.metadata?.mimeType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileDoc.filename}"`);

    const downloadStream = bucket.openDownloadStream(fileDoc._id);
    downloadStream.on('error', (err) => {
      console.error('GridFS download error:', err);
      res.sendStatus(404);
    });
    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no download' });
  }
});

/**
 * DELETE /api/images/:identifier
 * identifier = filename OR fileId
 * Remove o arquivo do GridFS.
 */
router.delete('/images/:identifier', async (req, res) => {
  try {
    const { bucket, db } = await connectDB();
    const identifier = req.params.identifier;
    const fileDoc = await findFile(db, identifier);
    if (!fileDoc) return res.status(404).json({ error: 'Arquivo não encontrado' });

    await bucket.delete(fileDoc._id);
    // opcional: aqui você pode atualizar coleções que referenciam esse filename
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
});

export default router;
