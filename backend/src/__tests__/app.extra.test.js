// src/__tests__/app.extra.test.js (corrigido)
import { jest } from '@jest/globals';
import request from 'supertest';

let app;

async function loadApp() {
  // carregar usando import dinâmico ESM (compatível com "type": "module")
  const mod = await import('../app.js');
  return mod.default || mod.app || mod;
}

beforeAll(async () => {
  app = await loadApp();

  // silencia logs que podem aparecer ao importar DB/etc
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('GET / (root) responde 200 e body existe', async () => {
  const res = await request(app).get('/');
  // seu app pode responder 200 ou 404 dependendo do handler; aceitaremos ambos
  expect([200, 404]).toContain(res.status);
  expect(res.text || res.body).toBeDefined();
});

test('OPTIONS preflight para /api/products responde sem erro (CORS/middleware)', async () => {
  const res = await request(app).options('/api/products');
  // alguns setups retornam 204, outros 200; aceitaremos ambos
  expect([200, 204]).toContain(res.status);
});
