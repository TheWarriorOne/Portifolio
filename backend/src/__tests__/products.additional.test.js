import { jest } from '@jest/globals';
import request from 'supertest';
import ImageModel from '../models/Image.js';
import { app } from '../index.js';

describe('Products error paths', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/products -> 500 quando Image.find falha (mockRejected via lean)', async () => {
    // Em vez de fazer ImageModel.find.mockRejectedValue(...)
    // retornamos um objeto com .lean que rejeita — corresponde ao uso: ImageModel.find(...).lean()
    jest.spyOn(ImageModel, 'find').mockImplementation(() => ({
      lean: jest.fn().mockRejectedValue(new Error('mocked-find-error'))
    }));

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
