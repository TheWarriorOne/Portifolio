// backend/src/routes/products.js
import express from 'express';
import ImageModel from '../models/Image.js';  // <-- seu model de produtos/imagens
import { ObjectId } from 'mongodb';
import { connectDB, getBucket } from '../db.js'; // ajuste caminhos se necessário

const router = express.Router();

/**
 * GET /api/products
 * Lista todos os produtos
 */
router.get('/api/products', async (req, res) => {
  try {
    const products = await ImageModel.find({}).lean();
    res.json(products);
  } catch (err) {
    console.error("Erro /api/products", err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});


/**
 * POST /api/approve
 * Aprovar / rejeitar / remover aprovação / remover rejeição
 */
router.post('/api/approve', async (req, res) => {
  try {
    const { productId, imageIdentifier, action } = req.body;

    if (!productId || !imageIdentifier || !action)
      return res.status(400).json({ error: 'Dados incompletos.' });

    // Encontra o produto (seu model usa "id", não "_id")
    const product = await ImageModel.findOne({ id: String(productId) });
    if (!product)
      return res.status(404).json({ error: 'Produto não encontrado' });

    // Encontra a imagem por gridFsId ou por nome
    const index = product.imagens.findIndex(
      (img) =>
        img.gridFsId === imageIdentifier || img.name === imageIdentifier
    );

    if (index === -1)
      return res.status(404).json({ error: 'Imagem não encontrada no produto' });

    const img = product.imagens[index];

    switch (action) {
      case 'approve':
        img.approved = true;
        img.rejected = false;
        break;
      case 'unapprove':
        img.approved = false;
        break;
      case 'reject':
        img.rejected = true;
        img.approved = false;
        break;
      case 'unreject':
        img.rejected = false;
        break;
      default:
        return res.status(400).json({ error: 'Ação inválida' });
    }

    await product.save();

    return res.json({ ok: true, product });

  } catch (err) {
    console.error("Erro /api/approve", err);
    return res.status(500).json({ error: 'Erro interno ao aprovar/reprovar imagem' });
  }
});

router.put('/api/products/:id/order', async (req, res) => {
  try {
    const productId = req.params.id;
    const { order } = req.body;

    if (!order || !Array.isArray(order)) {
      return res.status(400).json({ error: 'Body inválido. Esperado { order: [...] }' });
    }

    // procura pelo campo "id" (como em /api/approve)
    const product = await ImageModel.findOne({ id: String(productId) });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    // cria um mapa para buscar imagens rapidamente por gridFsId ou name
    const imgMap = new Map();
    product.imagens.forEach((img) => {
      if (img.gridFsId) imgMap.set(String(img.gridFsId), img);
      if (img.name) imgMap.set(String(img.name), img);
    });

    // monta nova lista seguindo o array `order`. 
    // Se alguma identifier não existir, mantenha a imagem original (fallback).
    const newImagens = [];
    const used = new Set();

    for (const identifier of order) {
      const key = String(identifier);
      const found = imgMap.get(key);
      if (found) {
        newImagens.push(found);
        used.add(found._id?.toString() || found.name);
      } else {
        // identifier não encontrada: opcionalmente logar e seguir
        console.warn(`Order identifier not found for product ${productId}:`, identifier);
      }
    }

    // adiciona quaisquer imagens que não foram incluídas no order (evita perda)
    for (const img of product.imagens) {
      const uniqueKey = img._id ? String(img._id) : img.name;
      if (!used.has(uniqueKey) && !used.has(img.name) && !used.has(img.gridFsId)) {
        newImagens.push(img);
      }
    }

    // substitui e salva
    product.imagens = newImagens;
    await product.save();

    return res.json({ ok: true, product });
  } catch (err) {
    console.error('Erro PUT /api/products/:id/order', err);
    return res.status(500).json({ error: 'Erro interno ao atualizar ordem' });
  }
});

router.delete('/api/products/:id/image/:identifier', async (req, res) => {
  try {
    const productId = req.params.id;
    const identifier = req.params.identifier;

    // 1) encontra produto pelo campo `id` (como seu /api/approve faz)
    const product = await ImageModel.findOne({ id: String(productId) });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    // 2) tentar localizar a imagem dentro do produto (por gridFsId ou nome)
    const imgIndex = product.imagens.findIndex(
      (i) => String(i.gridFsId) === String(identifier) || String(i.name) === String(identifier)
    );
    if (imgIndex === -1) {
      return res.status(404).json({ error: 'Imagem não encontrada no produto' });
    }

    const img = product.imagens[imgIndex];

    // 3) remove referência localmente
    product.imagens.splice(imgIndex, 1);
    await product.save();

    // 4) tenta remover do GridFS (se tiver gridFsId ou se existir arquivo com esse filename)
    try {
      // inicializa DB/bucket
      const { db } = await connectDB();
      const bucket = getBucket();

      // procura por fileDoc por _id (ObjectId) ou filename
      let fileDoc = null;
      const filesCol = db.collection(`${process.env.GRIDFS_BUCKET || 'uploads'}.files`);
      if (ObjectId.isValid(identifier)) {
        fileDoc = await filesCol.findOne({ _id: new ObjectId(identifier) });
      }
      if (!fileDoc) {
        // tenta por filename (nome do arquivo)
        fileDoc = await filesCol.findOne({ filename: identifier });
      }

      if (fileDoc) {
        await bucket.delete(fileDoc._id);
      } else {
        console.warn('DELETE image: arquivo GridFS não encontrado para identifier=', identifier);
      }
    } catch (gfErr) {
      console.error('Erro ao deletar do GridFS (mas já removi a referência do produto):', gfErr);
      // não falhar completamente — já removemos a referência do produto
    }

    return res.json({ ok: true, removedFromProductsCount: 1, product });
  } catch (err) {
    console.error('Erro DELETE /api/products/:id/image/:identifier', err);
    return res.status(500).json({ error: 'Erro interno ao excluir imagem' });
  }
});

export default router;
