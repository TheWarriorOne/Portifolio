// backend/src/__tests__/products.extra.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

import ImageModel from '../models/Image.js';
import { app } from '../index.js';

afterEach(() => jest.clearAllMocks());

test('POST /api/approve - product not found returns 404', async () => {
  ImageModel.findOne = jest.fn().mockResolvedValue(null);
  const res = await request(app).post('/api/approve').send({ productId: 'not-exists', imageIdentifier: 'x', action: 'approve' });
  expect(res.status).toBe(404);
  expect(res.body).toHaveProperty('error');
});

test('POST /api/approve - image not found returns 404', async () => {
  const product = { id: 'prod-1', imagens: [{ gridFsId: 'g2', name: 'img2.jpg' }], save: jest.fn() };
  ImageModel.findOne = jest.fn().mockResolvedValue(product);
  const res = await request(app).post('/api/approve').send({ productId: 'prod-1', imageIdentifier: 'nope', action: 'approve' });
  expect(res.status).toBe(404);
  expect(res.body).toHaveProperty('error');
});
