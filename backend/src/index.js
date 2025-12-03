// src/index.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import Image from './models/Image.js';
import User from './models/User.js';

// routers
import productsRouter from './routes/products.js';
import uploadRouter from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * CORS – libera:
 * - Front local (Vite)
 * - Backend local
 * - Seu CloudFront: d32ppjbrqo5tv3.cloudfront.net
 */
const whitelist = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://d32ppjbrqo5tv3.cloudfront.net',
];

const corsOptions = {
  origin: (origin, callback) => {
    // requisições sem origin (Postman, curl, health-check) -> permite
    if (!origin) return callback(null, true);

    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    console.warn('❌ CORS bloqueou origem:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
};

app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pré-flight

// ------ UPLOADS / STATIC ------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// pasta estática para uploads, se você usar disco em vez de memória
app.use(
  '/api/uploads/static',
  express.static(path.join(__dirname, './api/uploads')),
);

// ------ ROTA HEALTHCHECK ------
app.get('/', (req, res) => {
  res.json({ message: 'API Portifolio online' });
});

// ------ AUTH HANDLERS ------
async function handleRegister(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

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

    if (!username || !password) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '8h' },
    );

    return res.json({ message: 'Login bem-sucedido', token });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro no login' });
  }
}

// Rotas de auth – mantém /register e /api/register por compatibilidade
app.post('/register', handleRegister);
app.post('/login', handleLogin);
app.post('/api/register', handleRegister);
app.post('/api/login', handleLogin);

// ---- SUAS ROTAS PRINCIPAIS ----
app.use('/', uploadRouter);
app.use('/', productsRouter);

// Rota de debug para listar rotas
app.get('/__routes', (req, res) => {
  const routes = [];

  app._router.stack.forEach((m) => {
    if (m.route && m.route.path) {
      const methods = Object.keys(m.route.methods).join(',');
      routes.push({ path: m.route.path, methods });
    } else if (m.name === 'router' && m.handle && m.handle.stack) {
      m.handle.stack.forEach((r) => {
        if (r.route) {
          const methods = Object.keys(r.route.methods).join(',');
          routes.push({ path: r.route.path, methods });
        }
      });
    }
  });

  res.json(routes);
});

// Exporta app como NAMED export (para o server.js)
export { app };
