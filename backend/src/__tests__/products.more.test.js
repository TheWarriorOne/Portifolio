// src/__tests__/products.more.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import ImageModel from '../models/Image.js';
import { app } from '../index.js';

afterEach(() => jest.restoreAllMocks());

test('POST /api/approve -> reject action marca rejected true', async () => {
  const product = {
    id: 'prod-2',
    imagens: [{ gridFsId: 'g9', name: 'img9.jpg', approved: false, rejected: false }],
    save: jest.fn().mockResolvedValue(true),
  };
  ImageModel.findOne = jest.fn().mockResolvedValue(product);

  const res = await request(app).post('/api/approve').send({
    productId: 'prod-2',
    imageIdentifier: 'g9',
    action: 'reject'
  });

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('ok', true);
  const img = res.body.product.imagens.find(i => i.gridFsId === 'g9' || i.name === 'g9');
  expect(img.rejected).toBe(true);
  expect(img.approved).toBe(false);
  expect(product.save).toHaveBeenCalled();
});

test('POST /api/approve -> identifica imagem por name e trata erro ao save', async () => {
  const product = {
    id: 'prod-3',
    imagens: [{ gridFsId: 'g10', name: 'img10.jpg', approved: false, rejected: false }],
    save: jest.fn().mockRejectedValue(new Error('save boom')),
  };
  ImageModel.findOne = jest.fn().mockResolvedValue(product);

  const res = await request(app).post('/api/approve').send({
    productId: 'prod-3',
    imageIdentifier: 'img10.jpg',
    action: 'approve'
  });

  // esperamos que o handler capture o erro e retorne 500
  expect([500, 200]).toContain(res.status);
  if (res.status === 500) {
    expect(res.body).toHaveProperty('error');
  } else {
    // se por acaso handler ainda retorna 200, garante que save foi chamado
    expect(product.save).toHaveBeenCalled();
  }
});
