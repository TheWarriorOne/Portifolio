// backend/src/index.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import Image from './models/Image.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// routers
import productsRouter from './routes/products.js';
import uploadRouter from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// ------------ CORS DINÂMICO SEGURO ------------
const whitelist = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://d32ppjbrqo5tv3.cloudfront.net'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    console.warn('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Origin','Accept']
};

app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Multer / static uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.use('/api/uploads/static', express.static(path.join(__dirname, './api/uploads')));

// Rotas e handlers
app.get('/', (req, res) => res.json({ message: 'API Portifolio online' }));

async function handleRegister(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Dados incompletos' });
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Usuário já existe' });
    const hash = bcrypt.hashSync(password, 10);
    const user = await User.create({ username, password: hash });
    return res.json({ message: 'Usuário criado', id: user._id });
  } catch (err) {
    console.error('Erro no register:', err);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

async function handleLogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Dados incompletos' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '8h' }
    );
    return res.json({ message: 'Login bem-sucedido', token });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro no login' });
  }
}

app.post('/register', handleRegister);
app.post('/login', handleLogin);
app.post('/api/register', handleRegister);
app.post('/api/login', handleLogin);

app.use('/', productsRouter);
app.use('/', uploadRouter);

// Export app para testes
export { app };

// Somente conecte DB e rode o servidor quando NÃO estivermos em ambiente de teste.
// Isso evita listeners abertos durante o jest.
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await connectDB();
      console.log('MongoDB conectado!');
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
      });
    } catch (err) {
      console.error('Erro ao iniciar servidor:', err);
      process.exit(1);
    }
  })();
}
