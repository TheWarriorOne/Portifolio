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

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '123') {
    res.json({ message: 'Login bem-sucedido', token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// ===================== Rota de upload atualizada =====================
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const fileType = await fileTypeFromBuffer(req.file.buffer);
    if (!fileType || !fileType.mime.startsWith('image/')) {
      return res.status(400).json({ error: 'Arquivo não é uma imagem válida' });
    }

    const { id = 'default', descricao = 'default', grupo = 'default' } = req.body;
    const fileName = Date.now() + '-' + req.file.originalname;
    const fullPath = path.join(__dirname, '../Uploads', fileName);

    // Salva a imagem na pasta Uploads
    fs.writeFileSync(fullPath, req.file.buffer);

    // ================== Salva metadados no MongoDB ==================
    const imageDoc = await Image.create({ fileName, id, descricao, grupo });

    res.json({
      message: 'Upload realizado com sucesso',
      fileName,
      id,
      descricao,
      grupo,
      mongoId: imageDoc._id // Retorna o ID do Mongo
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

    // Agrupa por id
    const grouped = images.reduce((acc, img) => {
      if (!acc[img.id]) acc[img.id] = [];
      acc[img.id].push(img);
      return acc;
    }, {});

    // Formata resultado
    const products = Object.entries(grouped).map(([id, imgs]) => ({
      id,
      descricao: imgs[0].descricao,
      grupo: imgs[0].grupo,
      imagens: imgs.map(i => i.fileName)
    }));

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
