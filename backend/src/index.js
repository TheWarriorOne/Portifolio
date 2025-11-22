import express from 'express';
import cors from 'cors';
import multer from 'multer';
import morgan from 'morgan';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import Image from './models/Image.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'API Portifolio online' });
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Dados incompletos' });

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Usuário já existe' });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = await User.create({ username, password: hash });

    console.log('Usuário criado:', user.username);
    return res.json({ message: 'Usuário criado', id: user._id });
  } catch (err) {
    console.error('Erro no /register:', err);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

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

    console.log('Login bem-sucedido:', user.username);
    return res.json({ message: 'Login bem-sucedido', token });
  } catch (err) {
    console.error('Erro no /login:', err);
    return res.status(500).json({ error: 'Erro no login' });
  }
});

app.post('/upload', upload.array('images'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    for (const file of req.files) {
      const fileType = await fileTypeFromBuffer(file.buffer);
      if (!fileType || !fileType.mime.startsWith('image/')) {
        return res.status(400).json({ error: 'Um ou mais arquivos não são imagens válidas' });
      }
    }

    const { id = 'default', descricao = 'default', grupo = 'default' } = req.body;
    const fileNames = req.files.map(file => {
      const fileName = Date.now() + '-' + file.originalname;
      const fullPath = path.join(__dirname, '../uploads', fileName); // Corrigido para 'uploads'
      fs.writeFileSync(fullPath, file.buffer);
      return { name: fileName, approved: false, rejected: false };
    });

    const product = await Image.findOneAndUpdate(
      { id },
      { descricao, grupo, imagens: fileNames },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: 'Upload realizado com sucesso',
      id,
      descricao,
      grupo,
      imagens: fileNames,
      mongoId: product._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no upload' });
  }
});

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
      acc[img.id].imagens.push(...img.imagens);
      return acc;
    }, {});

    const products = Object.values(grouped);

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.post('/approve', async (req, res) => {
  try {
    const { productId, imageName, action } = req.body;
    const product = await Image.findOne({ id: productId });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    product.imagens = product.imagens.map((img) => {
      if (img.name === imageName) {
        if (action === 'approve') {
          return { ...img, approved: true, rejected: false };
        } else if (action === 'unapprove') {
          return { ...img, approved: false, rejected: false };
        } else if (action === 'reject') {
          return { ...img, approved: false, rejected: true };
        } else if (action === 'unreject') {
          return { ...img, approved: false, rejected: false };
        }
      }
      return img;
    });
    await product.save();

    console.log('Imagem atualizada:', imageName, 'approved:', product.imagens.find(img => img.name === imageName).approved, 'rejected:', product.imagens.find(img => img.name === imageName).rejected);
    res.json({ message: 'Status atualizado com sucesso', product });
  } catch (err) {
    console.error('Erro ao aprovar/rejeitar imagem:', err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

app.delete('/images/:imageName', async (req, res) => {
  const { imageName } = req.params;

  try {
    const imagePath = path.join('uploads', imageName);

    const updatedProduct = await Image.findOneAndUpdate(
      { 'imagens.name': imageName },
      { $pull: { imagens: { name: imageName } } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Imagem não encontrada no banco!' });
    }

    fs.unlink(imagePath, (err) => {
      if (err) console.log("Imagem não existe fisicamente:", imageName);
    });

    res.json({ message: 'Imagem excluída com sucesso!' });
  } catch (error) {
    console.error("Erro ao excluir imagem:", error);
    res.status(500).json({ error: 'Erro ao excluir imagem.' });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Atualiza a ordem das imagens de um produto
app.put('/products/:id/order', async (req, res) => {
  try {
    const { id } = req.params;              // id do produto (string que você usa no campo "id")
    const { order } = req.body;             // array de nomes de imagem na nova ordem

    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ error: 'O campo "order" deve ser um array com os nomes das imagens.' });
    }

    const product = await Image.findOne({ id });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    const currentNames = product.imagens.map((i) => i.name);
    // valida se todos existem
    const allExist = order.every((name) => currentNames.includes(name));
    if (!allExist) {
      return res.status(400).json({ error: 'A ordem contém nomes que não pertencem ao produto.' });
    }

    // monta novo array preservando approved/rejected
    const map = new Map(product.imagens.map((i) => [i.name, i]));
    product.imagens = order.map((name) => map.get(name)).filter(Boolean);

    await product.save();
    res.json({ message: 'Ordem atualizada com sucesso', product });
  } catch (err) {
    console.error('Erro ao atualizar ordem:', err);
    res.status(500).json({ error: 'Erro ao atualizar ordem das imagens' });
  }
});
