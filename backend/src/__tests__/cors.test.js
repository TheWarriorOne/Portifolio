// backend/src/__tests__/cors.test.js
import request from 'supertest';
import { app } from '../index.js';

test('OPTIONS preflight returns CORS headers', async () => {
  const res = await request(app)
    .options('/api/products')
    .set('Origin', 'http://localhost:5173')
    .set('Access-Control-Request-Method', 'POST');

  // Preflight deve retornar 204/200 (se sua app usa app.options('*', cors(...)) pode ser 204 or 200)
  expect([200, 204]).toContain(res.status);
  // Cabeçalhos CORS esperados (pelo seu corsOptions)
  expect(res.headers['access-control-allow-origin']).toBeDefined();
  expect(res.headers['access-control-allow-headers']).toBeDefined();
});
