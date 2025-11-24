// backend/src/routes/products.js
import express from 'express';
import ImageModel from '../models/Image.js';  // <-- seu model de produtos/imagens

const router = express.Router();

/**
 * GET /api/products
 * Lista todos os produtos
 */
router.get('/products', async (req, res) => {
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
router.post('/approve', async (req, res) => {
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

export default router;
