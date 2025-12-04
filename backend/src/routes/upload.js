// backend/src/routes/upload.js
import express from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import { ObjectId } from 'mongodb';
import { connectDB, getBucket } from '../db.js';
import ImageModel from './models/Image.js';


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

router.post('/api/uploads', upload.array('images', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {
    // garante db + bucket inicializados
    await connectDB();
    const bucket = getBucket();

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

    const productId = req.body.id;
    const descricaoFromBody = req.body.descricao || req.body.description || null;
    const grupoFromBody = req.body.grupo || req.body.group || null;

let product = null;
if (productId) {
  try {
    // importa o model no topo do arquivo: import ImageModel from './models/Image.js';
    // monta o array de imagens para inserir no documento do produto
    const newImgs = results.map(r => ({
      gridFsId: r.fileId,     // id do file em GridFS (string)
      name: r.filename,       // nome do arquivo (filename)
      uploadedAt: r.uploadDate || new Date(),
      approved: false,
      rejected: false,
    }));

    // atualiza (ou cria) o produto com upsert
    product = await ImageModel.findOneAndUpdate(
      { id: String(productId) }, // procura por campo `id` (compatível com seu products.js)
      {
        $push: { imagens: { $each: newImgs } },
        $setOnInsert: {
          id: String(productId),
          descricao: descricaoFromBody || 'Sem descrição',
          grupo: grupoFromBody || 'Sem grupo',
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    console.log(`Upload OK e produto atualizado/criado (id=${productId})`);
  } catch (err) {
    console.error('Erro ao criar/atualizar ImageModel após upload:', err);
    // não falhar o upload por causa do DB do produto — avise no response
  }
}

// Retorna uploads e (quando criado/atualizado) o produto
return res.status(201).json({
  uploaded: results,
  product: product ? product : undefined,
  message: product ? 'Uploads gravados e produto atualizado' : 'Uploads gravados (produto não informado)',
});
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
    const { db } = await connectDB();
    const bucket = getBucket();
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
    const { db } = await connectDB();
    const bucket = getBucket();
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
