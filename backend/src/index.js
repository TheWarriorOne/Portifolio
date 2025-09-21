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

app.use('/uploads', express.static(path.join(__dirname, '../Uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'API Portifolio online' });
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Dados incompletos' });

    // checar se já existe
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Usuário já existe' });

    // hash da senha
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

// ROTA: login (consulta Mongo, compara senha e retorna token JWT)
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Dados incompletos' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    // compara hash
    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });

    // cria JWT simples
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


/// ===================== Rota de upload atualizada =====================
app.post('/upload', upload.array('images'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Verifica se todos os arquivos são imagens
    for (const file of req.files) {
      const fileType = await fileTypeFromBuffer(file.buffer);
      if (!fileType || !fileType.mime.startsWith('image/')) {
        return res.status(400).json({ error: 'Um ou mais arquivos não são imagens válidas' });
      }
    }

    const { id = 'default', descricao = 'default', grupo = 'default' } = req.body;
    const fileNames = req.files.map(file => {
      const fileName = Date.now() + '-' + file.originalname;
      const fullPath = path.join(__dirname, '../Uploads', fileName);
      fs.writeFileSync(fullPath, file.buffer);
      return fileName;
    });

    // Salva ou atualiza o produto com todas as imagens
    const product = await Image.findOneAndUpdate(
      { id },
      { descricao, grupo, imagens: fileNames }, // Adiciona campo 'imagens' como array
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

// ==================================================================

app.get('/products', async (req, res) => {
  try {
    const { id, descricao, grupo } = req.query;

    // Cria filtro dinamicamente
    const filter = {};
    if (id) filter.id = { $regex: id, $options: "i" };
    if (descricao) filter.descricao = { $regex: descricao, $options: "i" };
    if (grupo) filter.grupo = { $regex: grupo, $options: "i" };

    // Busca no MongoDB
    const images = await Image.find(filter).sort({ createdAt: 1 });

    // Agrupa por id e formata o resultado
    const grouped = images.reduce((acc, img) => {
      if (!acc[img.id]) {
        acc[img.id] = {
          id: img.id,
          descricao: img.descricao,
          grupo: img.grupo,
          imagens: []
        };
      }
      acc[img.id].imagens.push(...img.imagens); // Adiciona todas as imagens do documento
      return acc;
    }, {});

    // Converte o objeto agrupado em array
    const products = Object.values(grouped);

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.delete('/images/:name', (req, res) => {
  const filePath = path.join(__dirname, '../Uploads', req.params.name);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar arquivo' });
    res.json({ message: 'Imagem deletada com sucesso' });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
