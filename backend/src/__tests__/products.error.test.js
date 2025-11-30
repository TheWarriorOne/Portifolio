// backend/src/__tests__/products.error.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

import ImageModel from '../models/Image.js';
import { app } from '../index.js';

afterEach(() => jest.clearAllMocks());

test('POST /api/approve returns 500 when DB throws', async () => {
  // força um erro inesperado no DB
  ImageModel.findOne = jest.fn().mockImplementation(() => { throw new Error('boom'); });

  const payload = { productId: 'prod-x', imageIdentifier: 'img-x', action: 'approve' };
  const res = await request(app).post('/api/approve').send(payload);
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty('error');
});
