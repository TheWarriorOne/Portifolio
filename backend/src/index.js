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

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    console.log('Campo recebido:', req.file);
    const fileType = await fileTypeFromBuffer(req.file.buffer);
    console.log('Tipo detectado:', fileType);
    if (!fileType || !fileType.mime.startsWith('image/')) {
      return res.status(400).json({ error: 'Arquivo não é uma imagem válida', mime: fileType?.mime });
    }
    const fileName = Date.now() + '-' + req.file.originalname;
    fs.writeFileSync(`Uploads/${fileName}`, req.file.buffer);
    res.json({ message: 'Upload realizado com sucesso', fileName });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ error: 'Erro no upload', details: err.message });
  }
});

app.get('/images', (req, res) => {
  fs.readdir(path.join(__dirname, '../Uploads'), (err, files) => {
    if (err) return res.status(500).json({ error: 'Não foi possível ler a pasta' });
    res.json(files);
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