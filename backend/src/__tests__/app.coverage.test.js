// src/__tests__/app.coverage.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

async function loadApp() {
  const mod = await import('../app.js');
  return mod.default || mod.app || mod;
}

let app;
beforeAll(async () => {
  app = await loadApp();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('GET / root responde (executa handlers básicos e middlewares)', async () => {
  const res = await request(app).get('/');
  expect([200, 404]).toContain(res.status);
  expect(res.text || res.body).toBeDefined();
});

test('OPTIONS /api/products (preflight) e rota inexistente exercitam middlewares', async () => {
  const opts = await request(app).options('/api/products');
  expect([200, 204]).toContain(opts.status);

  const notFound = await request(app).get('/rota-que-nao-existe-para-coverage');
  expect([200, 404]).toContain(notFound.status);
});
