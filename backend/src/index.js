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

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const fileType = await fileTypeFromBuffer(req.file.buffer);
    if (!fileType || !fileType.mime.startsWith('image/')) {
      return res.status(400).json({ error: 'Arquivo não é uma imagem válida' });
    }
    const { id = 'default', descricao = 'default', grupo = 'default' } = req.body;
    const fileName = Date.now() + '-' + req.file.originalname;
    const fullPath = `Uploads/${fileName}`;
    fs.writeFileSync(fullPath, req.file.buffer);
    // Salvar metadados
    const metadataPath = path.join(__dirname, '../Uploads/metadata.json');
    const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath)) : {};
    metadata[fileName] = { id, descricao, grupo };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    res.json({ message: 'Upload realizado com sucesso', fileName, id, descricao, grupo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no upload' });
  }
});

app.get('/products', (req, res) => {
  const { id, descricao, grupo } = req.query;
  console.log('Busca por:', { id, descricao, grupo });
  const uploadsDir = path.join(__dirname, '../Uploads');
  const metadataPath = path.join(__dirname, '../Uploads/metadata.json');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Erro ao ler pasta:', err);
      return res.status(500).json({ error: 'Não foi possível ler a pasta', details: err.message });
    }
    const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath)) : {};
    const filteredFiles = files
      .filter(file => file !== 'metadata.json')
      .filter(file => {
        const meta = metadata[file] || {};
        return (
          (!id || meta.id?.toLowerCase().includes(id.toLowerCase())) &&
          (!descricao || meta.descricao?.toLowerCase().includes(descricao.toLowerCase())) &&
          (!grupo || meta.grupo?.toLowerCase().includes(grupo.toLowerCase()))
        );
      });
    const grouped = filteredFiles.reduce((acc, file) => {
      const meta = metadata[file] || { id: 'default' };
      const key = meta.id || 'default';
      if (!acc[key]) acc[key] = [];
      acc[key].push(file);
      return acc;
    }, {});
    const products = Object.entries(grouped).map(([id, imgs]) => ({
      id,
      descricao: metadata[imgs[0]]?.descricao || 'Sem descrição',
      grupo: metadata[imgs[0]]?.grupo || 'Sem grupo',
      imagens: imgs,
    }));
    console.log('Produtos retornados:', products);
    res.json(products);
  });
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