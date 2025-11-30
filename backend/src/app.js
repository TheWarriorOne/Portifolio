// src/app.js (ESM, alinhado com index.js)
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import uploadRouter from './routes/upload.js';
import productsRouter from './routes/products.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
// outras middlewares (ex: auth)

app.use('/', productsRouter);
app.use('/', uploadRouter);

app.get('/', (req, res) => res.json({ ok: true }));

export default app;
export { app };
