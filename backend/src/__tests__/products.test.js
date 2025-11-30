// src/__tests__/products.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

import ImageModel from '../models/Image.js';
import { app } from '../index.js';

afterEach(() => jest.clearAllMocks());

describe('Products routes (unit)', () => {
  test('GET /api/products returns list', async () => {
    // Mock ImageModel.find(...).lean().exec() style -> retornamos objeto com .lean
    ImageModel.find = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ id: 'prod-1', descricao: 'P1' }])
    });

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id', 'prod-1');
  });

  test('POST /api/approve - approve action', async () => {
    const product = {
      id: 'prod-1',
      imagens: [{ gridFsId: 'g1', name: 'img1.jpg', approved: false, rejected: false }],
      save: jest.fn().mockResolvedValue(true),
    };
    ImageModel.findOne = jest.fn().mockResolvedValue(product);

    const payload = { productId: 'prod-1', imageIdentifier: 'g1', action: 'approve' };
    const res = await request(app).post('/api/approve').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    const img = res.body.product.imagens.find(i => i.gridFsId === 'g1' || i.name === 'g1');
    expect(img.approved).toBe(true);
    expect(img.rejected).toBe(false);
    expect(product.save).toHaveBeenCalled();
  });

  test('POST /api/approve - invalid action returns 400', async () => {
    const product = { id: 'prod-1', imagens: [{ gridFsId: 'g1', name: 'img1.jpg' }], save: jest.fn() };
    ImageModel.findOne = jest.fn().mockResolvedValue(product);

    const res = await request(app).post('/api/approve').send({ productId: 'prod-1', imageIdentifier: 'g1', action: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
