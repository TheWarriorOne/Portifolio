// backend/src/index.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import morgan from 'morgan';
import { fileTypeFromBuffer } from 'file-type';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js'; // sua função de conexão (assume que retorna { db, bucket } quando await)
import Image from './models/Image.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

// Multer (usado no upload legacy)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve uploads locais (legacy)
app.use('/api/uploads', express.static(path.join(__dirname, '../api/uploads')));

// -----------------------------------------------------------------------------
// ROTA HOME
// -----------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ message: 'API Portifolio online' });
});

// -----------------------------------------------------------------------------
// REGISTER / LOGIN
// -----------------------------------------------------------------------------
async function handleRegister(req, res) {
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

    console.log('Login bem-sucedido:', user.username);
    return res.json({ message: 'Login bem-sucedido', token });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro no login' });
  }
}

// Rotas de auth (compatível com front)
app.post('/register', handleRegister);
app.post('/login', handleLogin);
app.post('/api/register', handleRegister);
app.post('/api/login', handleLogin);

// -----------------------------------------------------------------------------
// UPLOAD LEGACY (grava arquivos no folder /uploads local)
// -----------------------------------------------------------------------------
app.post('/api/uploads', upload.array('images'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Conectar e obter bucket (connectDB já retorna { db, bucket })
    const { db, bucket } = await connectDB();

    const { id = 'default', descricao = 'default', grupo = 'default' } = req.body;

    const savedImages = [];

    // Para cada arquivo, crie um uploadStream no GridFS e aguarde finish
    for (const file of req.files) {
      // nome no GridFS: timestamp-originalname (igual ao que você usava)
      const fileName = Date.now() + '-' + file.originalname;

      // openUploadStream aceita contentType
      const uploadStream = bucket.openUploadStream(fileName, {
        contentType: file.mimetype,
        metadata: { originalname: file.originalname, uploadedAt: new Date() },
      });

      // escreve o buffer e aguarda finish
      await new Promise((resolve, reject) => {
        uploadStream.end(file.buffer, (err) => {
          if (err) return reject(err);
        });
        uploadStream.on('finish', () => resolve());
        uploadStream.on('error', (err) => reject(err));
      });

      // uploadStream.id é um ObjectId (do GridFS)
      const gridFsId = String(uploadStream.id);

      // guarda o registro que será salvo no product.imagens
      savedImages.push({
        name: fileName,
        approved: false,
        rejected: false,
        gridFsId,
        createdAt: new Date(),
      });
    }

    // Atualiza/insere o documento do produto na coleção via Mongoose (Image model)
    const product = await Image.findOneAndUpdate(
      { id },
      {
        descricao,
        grupo,
        $push: { imagens: { $each: savedImages } },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      message: 'Upload realizado com sucesso (GridFS)',
      id,
      descricao,
      grupo,
      imagens: savedImages,
      mongoId: product._id,
    });
  } catch (err) {
    console.error('Erro upload GridFS:', err);
    return res.status(500).json({ error: 'Erro no upload' });
  }
});

// -----------------------------------------------------------------------------
// LISTAR PRODUTOS (endpoint usado pelo frontend: GET /api/products)
// -----------------------------------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const { id, descricao, grupo } = req.query;
    const filter = {};
    if (id) filter.id = { $regex: id, $options: 'i' };
    if (descricao) filter.descricao = { $regex: descricao, $options: 'i' };
    if (grupo) filter.grupo = { $regex: grupo, $options: 'i' };

    // Aqui usamos modelo Image (o seu schema que tem id, descricao, grupo, imagens[])
    const images = await Image.find(filter).sort({ createdAt: 1 }).lean();

    // Agrupa por id (caso você tenha registros separados)
    const grouped = images.reduce((acc, img) => {
      if (!acc[img.id]) {
        acc[img.id] = {
          id: img.id,
          descricao: img.descricao,
          grupo: img.grupo,
          imagens: [],
        };
      }
      // garante que appenda o array imagens
      acc[img.id].imagens.push(...(img.imagens || []));
      return acc;
    }, {});

    return res.json(Object.values(grouped));
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// -----------------------------------------------------------------------------
// APROVA / REJEITA IMAGEM (POST /api/approve)
// Body: { productId, imageIdentifier, action }
// imageIdentifier pode ser gridFsId ou name
// -----------------------------------------------------------------------------
app.post('/api/approve', async (req, res) => {
  try {
    const { productId, imageIdentifier, action } = req.body;
    if (!productId || !imageIdentifier || !action) return res.status(400).json({ error: 'Dados insuficientes' });

    const product = await Image.findOne({ id: productId });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    product.imagens = product.imagens.map((img) => {
      // compara tanto por gridFsId quanto por name
      const matches = (img.gridFsId && String(img.gridFsId) === String(imageIdentifier)) || (img.name && img.name === imageIdentifier);
      if (!matches) return img;

      if (action === 'approve') return { ...img.toObject?.(), approved: true, rejected: false } || { ...img, approved: true, rejected: false };
      if (action === 'unapprove') return { ...img.toObject?.(), approved: false } || { ...img, approved: false };
      if (action === 'reject') return { ...img.toObject?.(), approved: false, rejected: true } || { ...img, approved: false, rejected: true };
      if (action === 'unreject') return { ...img.toObject?.(), rejected: false } || { ...img, rejected: false };

      return img;
    });

    await product.save();
    return res.json({ message: 'Status atualizado', product });
  } catch (err) {
    console.error('Erro no approve:', err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// -----------------------------------------------------------------------------
// ATUALIZA ORDEM DAS IMAGENS (PUT /api/products/:id/order)
// Body: { order: [ 'filename1', 'filename2', ...' ] }
// -----------------------------------------------------------------------------
app.put('/api/products/:id/order', async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;

    if (!Array.isArray(order) || order.length === 0) return res.status(400).json({ error: 'Order inválido' });

    const product = await Image.findOne({ id });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    const currentNames = product.imagens.map((i) => i.name);
    const allExist = order.every((name) => currentNames.includes(name));
    if (!allExist) return res.status(400).json({ error: 'Nomes inválidos na ordem' });

    const map = new Map(product.imagens.map((i) => [i.name, i]));
    product.imagens = order.map((name) => map.get(name)).filter(Boolean);

    await product.save();
    return res.json({ message: 'Ordem atualizada', product });
  } catch (err) {
    console.error('Erro ao atualizar ordem:', err);
    res.status(500).json({ error: 'Erro ao atualizar ordem' });
  }
});

// -----------------------------------------------------------------------------
// DELETE IMAGE (compatível com GridFS e com o seu array imagens)
// Endpoint chamado pelo frontend: DELETE /api/images/:identifier
// identifier pode ser:
//  - gridFsId (string ou ObjectId)
//  - filename (name)
// -----------------------------------------------------------------------------
// DELETE /api/products/:productId/image/:identifier
app.delete('/api/products/:productId/image/:identifier', async (req, res) => {
  const { productId, identifier } = req.params;

  try {
    const { db, bucket } = await connectDB();
    const bucketName = process.env.GRIDFS_BUCKET || 'uploads';
    const filesCol = db.collection(`${bucketName}.files`);
    const productsCol = db.collection('images');

    let fileDeleted = false;
    const isObjId = mongoose.Types.ObjectId.isValid(identifier);
    const idObj = isObjId ? new mongoose.Types.ObjectId(identifier) : null;

    // 1) Deletar do GridFS
    if (idObj) {
      try {
        await bucket.delete(idObj);
        fileDeleted = true;
      } catch (err) {
        /* arquivo pode já não existir */
      }
    }

    if (!fileDeleted) {
      const fileDoc = await filesCol.findOne({ filename: identifier });
      if (fileDoc) {
        try {
          await bucket.delete(fileDoc._id);
          fileDeleted = true;
        } catch (err) {
          /* ignora */
        }
      }
    }

    // 2) Remover referência do produto específico
    const productUpdate = await productsCol.updateOne(
      { id: productId },
      {
        $pull: {
          imagens: {
            $or: [
              { gridFsId: identifier },
              { gridFsId: idObj },
              { name: identifier }
            ]
          }
        }
      }
    );

    // 3) Se não removeu nada, remover de TODOS os documentos
    let fallbackUpdate = null;
    if (productUpdate.modifiedCount === 0) {
      fallbackUpdate = await productsCol.updateMany(
        {},
        {
          $pull: {
            imagens: {
              $or: [
                { gridFsId: identifier },
                { gridFsId: idObj },
                { name: identifier }
              ]
            }
          }
        }
      );
    }

    return res.json({
      ok: true,
      fileDeleted,
      removedFromProductsCount: productUpdate.modifiedCount + (fallbackUpdate?.modifiedCount || 0),
      productId,
      identifier
    });

  } catch (err) {
    console.error("Erro delete image:", err);
    res.status(500).json({ ok: false, error: "Erro ao deletar imagem" });
  }
});


// -----------------------------------------------------------------------------
// ROTA para servir imagens via GridFS (GET /api/uploads/:id)
// Se quiser servir via GridFS (em vez de /uploads static), implemente assim.
// -----------------------------------------------------------------------------
app.get('/api/uploads/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { db, bucket } = await connectDB();
    const filesCol = db.collection((process.env.GRIDFS_BUCKET || 'uploads') + '.files');

    // usa ObjectId do mongoose
    const { ObjectId } = mongoose.Types;

    // tenta achar por ObjectId
    if (ObjectId.isValid(identifier)) {
      const _id = new ObjectId(identifier);  // ✅ CORRETO
      const fileDoc = await filesCol.findOne({ _id });
      if (!fileDoc) return res.status(404).send('Not found');

      const stream = bucket.openDownloadStream(_id);
      res.setHeader('Content-Type', fileDoc.contentType || 'application/octet-stream');
      return stream.pipe(res);
    }

    // tenta por filename
    const fileDoc = await filesCol.findOne({ filename: identifier });
    if (!fileDoc) return res.status(404).send('Not found');

    const stream = bucket.openDownloadStream(fileDoc._id);
    res.setHeader('Content-Type', fileDoc.contentType || 'application/octet-stream');
    return stream.pipe(res);

  } catch (err) {
    console.error("Erro GET /api/uploads/:identifier", err);
    return res.status(500).send("Erro servidor");
  }
});

// -----------------------------------------------------------------------------
// Inicia servidor
// -----------------------------------------------------------------------------
// Inicialização do servidor SOMENTE após conectar ao MongoDB
(async () => {
  try {
    await connectDB();
    console.log('MongoDB conectado — iniciando servidor...');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
})();
