import express from 'express';
import cors from 'cors';
import multer from 'multer';
import morgan from 'morgan';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '123') {
    res.json({ message: 'Login bem-sucedido', token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const fileType = await fileTypeFromBuffer(req.file.buffer);
    if (!fileType || !fileType.mime.startsWith('image/')) {
      return res.status(400).json({ error: 'Arquivo não é uma imagem válida' });
    }
    const { codigo = 'default' } = req.body;
    const fileName = Date.now() + '-' + req.file.originalname;
    const fullPath = `Uploads/${fileName}`;
    fs.writeFileSync(fullPath, req.file.buffer);
    // Salvar metadados
    const metadataPath = path.join(__dirname, '../Uploads/metadata.json');
    const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath)) : {};
    metadata[fileName] = { codigo };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    res.json({ message: 'Upload realizado com sucesso', fileName, codigo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no upload' });
  }
});

app.get('/products', (req, res) => {
  const { search } = req.query;
  console.log('Busca por código:', search);
  const uploadsDir = path.join(__dirname, '../Uploads');
  const metadataPath = path.join(__dirname, '../Uploads/metadata.json');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Erro ao ler pasta:', err);
      return res.status(500).json({ error: 'Não foi possível ler a pasta', details: err.message });
    }
    const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath)) : {};
    const grouped = files
      .filter(file => file !== 'metadata.json')
      .reduce((acc, file) => {
        const codigo = metadata[file]?.codigo || 'default';
        if (!acc[codigo]) acc[codigo] = [];
        acc[codigo].push(file);
        return acc;
      }, {});
    const products = Object.entries(grouped).filter(([codigo]) => !search || codigo.includes(search));
    console.log('Produtos agrupados:', products);
    res.json(products);
  });
});

app.delete('/images/:name', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.name);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar arquivo' });
    res.json({ message: 'Imagem deletada com sucesso' });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});