// backend/src/index.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import morgan from 'morgan';
import { fileTypeFromBuffer } from 'file-type';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import Image from './models/Image.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

let gfsBucket;
let mongoClient;
async function initGridFS() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI não definido');
  mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await mongoClient.connect();
  const db = mongoClient.db();
  gfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
  console.log('GridFS preparado');
}
initGridFS().catch(err => {
  console.error('Erro ao inicializar GridFS:', err);
  process.exit(1);
});

app.get('/', (req, res) => res.json({ message: 'API Portifolio online' }));

// Register
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Dados incompletos' });
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Usuário já existe' });
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const user = await User.create({ username, password: hash });
    return res.json({ message: 'Usuário criado', id: user._id });
  } catch (err) {
    console.error('Erro no /register:', err);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Dados incompletos' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ message: 'Login bem-sucedido', token });
  } catch (err) {
    console.error('Erro no /login:', err);
    return res.status(500).json({ error: 'Erro no login' });
  }
});

// Upload images (GridFS)
app.post('/upload', upload.array('images'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    for (const file of req.files) {
      const fileType = await fileTypeFromBuffer(file.buffer);
      if (!fileType || !fileType.mime.startsWith('image/')) {
        return res.status(400).json({ error: 'Um ou mais arquivos não são imagens válidas' });
      }
    }

    const { id = 'default', descricao = 'default', grupo = 'default' } = req.body;

    const savedImages = [];

    for (const file of req.files) {
      const filename = Date.now() + '-' + file.originalname;

      const uploadStream = gfsBucket.openUploadStream(filename, {
        metadata: {
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        }
      });

      uploadStream.end(file.buffer);

      const fileDoc = await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      savedImages.push({
        name: filename,
        gridFsId: fileDoc._id.toString(),
        approved: false,
        rejected: false,
      });
    }

    const product = await Image.findOneAndUpdate(
      { id },
      { descricao, grupo, imagens: savedImages },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: 'Upload realizado com sucesso',
      id,
      descricao,
      grupo,
      imagens: savedImages,
      mongoId: product._id
    });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ error: 'Erro no upload' });
  }
});

// Serve image by gridFs id
app.get('/uploads/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).send('Id ausente');
    const _id = new ObjectId(id);

    const files = await gfsBucket.find({ _id }).toArray();
    if (!files || files.length === 0) return res.status(404).send('Arquivo não encontrado');

    const file = files[0];
    res.set('Content-Type', file.metadata?.mimetype || 'application/octet-stream');
    const downloadStream = gfsBucket.openDownloadStream(_id);
    downloadStream.pipe(res);
  } catch (err) {
    console.error('Erro ao servir upload:', err);
    res.status(500).send('Erro ao ler arquivo');
  }
});

// List products
app.get('/products', async (req, res) => {
  try {
    const { id, descricao, grupo } = req.query;
    const filter = {};
    if (id) filter.id = { $regex: id, $options: 'i' };
    if (descricao) filter.descricao = { $regex: descricao, $options: 'i' };
    if (grupo) filter.grupo = { $regex: grupo, $options: 'i' };

    const images = await Image.find(filter).sort({ createdAt: 1 });

    const grouped = images.reduce((acc, img) => {
      if (!acc[img.id]) {
        acc[img.id] = {
          id: img.id,
          descricao: img.descricao,
          grupo: img.grupo,
          imagens: []
        };
      }
      acc[img.id].imagens.push(...(img.imagens || []));
      return acc;
    }, {});

    const products = Object.values(grouped);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Approve / reject
app.post('/approve', async (req, res) => {
  try {
    const { productId, imageName, action } = req.body;
    const product = await Image.findOne({ id: productId });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    product.imagens = product.imagens.map((img) => {
      if (img.name === imageName) {
        if (action === 'approve') return { ...img, approved: true, rejected: false };
        if (action === 'unapprove') return { ...img, approved: false, rejected: false };
        if (action === 'reject') return { ...img, approved: false, rejected: true };
        if (action === 'unreject') return { ...img, approved: false, rejected: false };
      }
      return img;
    });
    await product.save();
    res.json({ message: 'Status atualizado com sucesso', product });
  } catch (err) {
    console.error('Erro ao aprovar/rejeitar imagem:', err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Delete image (GridFS + reference)
app.delete('/images/:imageName', async (req, res) => {
  try {
    const { imageName } = req.params;

    const product = await Image.findOne({ 'imagens.name': imageName });
    if (!product) return res.status(404).json({ error: 'Imagem não encontrada no banco!' });

    const imgObj = (product.imagens || []).find(i => i.name === imageName);
    if (!imgObj) return res.status(404).json({ error: 'Imagem não encontrada no produto' });

    if (imgObj.gridFsId) {
      try {
        await gfsBucket.delete(new ObjectId(imgObj.gridFsId));
      } catch (e) {
        console.warn('Erro ao deletar do GridFS (talvez já removido):', e.message);
      }
    }

    const updatedProduct = await Image.findOneAndUpdate(
      { 'imagens.name': imageName },
      { $pull: { imagens: { name: imageName } } },
      { new: true }
    );

    res.json({ message: 'Imagem deletada com sucesso', product: updatedProduct });
  } catch (err) {
    console.error('Erro ao deletar imagem:', err);
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
});

// Reorder images
app.put('/products/:productId/order', async (req, res) => {
  try {
    const { productId } = req.params;
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: 'Order inválido' });

    const product = await Image.findOne({ id: productId });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    const newImgs = [];
    for (const name of order) {
      const f = product.imagens.find(i => i.name === name);
      if (f) newImgs.push(f);
    }
    product.imagens = newImgs;
    await product.save();
    res.json({ message: 'Ordem atualizada', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar ordem' });
  }
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
