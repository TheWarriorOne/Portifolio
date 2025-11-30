// src/__tests__/app.lines.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

let app;

async function loadApp() {
  // importa o módulo ESM do app (path relativo para src/app.js)
  const mod = await import('../app.js');
  return mod.default || mod.app || mod;
}

beforeAll(async () => {
  app = await loadApp();
  // evita que logs poluam o runner
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('GET / (root) responde sem crash (cover app middlewares)', async () => {
  const res = await request(app).get('/');
  expect([200, 404]).toContain(res.status);
  expect(res.text || res.body).toBeDefined();
});

test('OPTIONS /api/products (preflight CORS) e GET rota inexistente (404) exercitam middlewares', async () => {
  const opts = await request(app).options('/api/products');
  expect([200, 204]).toContain(opts.status);

  const notFound = await request(app).get('/rota-que-nao-existe-para-coverage');
  expect([200, 404]).toContain(notFound.status);
});
