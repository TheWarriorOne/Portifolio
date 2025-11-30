// src/__tests__/products.lines.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

let app;
let ImageModel;

async function loadAppAndModel() {
  // importa os módulos ESM corretos (paths relativos)
  const modApp = await import('../app.js');
  const modImg = await import('../models/Image.js');
  return { app: modApp.default || modApp.app || modApp, ImageModel: modImg.default || modImg };
}

beforeAll(async () => {
  const loaded = await loadAppAndModel();
  app = loaded.app;
  ImageModel = loaded.ImageModel;

  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('GET /api/products -> retorna array quando Image.find().lean() funciona', async () => {
  // mock 'chainable' que retorna um array via .lean()
  const fakeResult = [{ filename: 'x.jpg', metadata: {} }];
  jest.spyOn(ImageModel, 'find').mockImplementation(() => {
    return { lean: () => Promise.resolve(fakeResult) };
  });

  const res = await request(app).get('/api/products');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty('filename', 'x.jpg');
});

test('GET /api/products -> retorna 500 quando Image.find rejeita (cobre bloco catch)', async () => {
  // para o cenário de erro, mockamos find para retornar objeto com lean que rejeita
  jest.spyOn(ImageModel, 'find').mockImplementation(() => ({
    lean: jest.fn().mockRejectedValue(new Error('mocked-find-error'))
  }));

  const res = await request(app).get('/api/products');
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty('error');
});
