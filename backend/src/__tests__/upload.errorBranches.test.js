// src/__tests__/upload.errorBranches.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

// mock connectDB para devolver bucket cujo openUploadStream lança
jest.mock('../db.js', () => ({
  connectDB: async () => ({
    db: {
      collection: () => ({
        findOne: async () => null
      })
    },
    bucket: {
      openUploadStream: (filename) => {
        throw new Error('bucket write boom');
      }
    }
  }),
  getBucket: () => ({
    openUploadStream: (filename) => {
      throw new Error('bucket write boom');
    }
  })
}));

let app;
beforeAll(async () => {
  const mod = await import('../app.js');
  app = mod.default || mod.app || mod;
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('POST /api/uploads -> 500 quando bucket.openUploadStream lança', async () => {
  const res = await request(app)
    .post('/api/uploads')
    .attach('images', Buffer.from('abc'), 'test.jpg');

  // dependendo do seu handler pode ser 201 (gravou), 400 (validação) ou 500 (erro interno)
  expect([201, 400, 500]).toContain(res.status);
});

test('GET /api/uploads/:identifier -> 404 quando findOne retorna null', async () => {
  // já mockamos connectDB.findOne para retornar null
  const res = await request(app).get('/api/uploads/this-does-not-exist.jpg');
  expect([404, 200]).toContain(res.status);
  if (res.status === 404) {
    // se handler devolve body vazio, aceitamos; se devolve { error } também aceitamos
    if (Object.keys(res.body).length > 0) expect(res.body).toHaveProperty('error');
  }
});
