// backend/src/__tests__/server.app.test.js
import request from 'supertest';
import { app } from '../index.js';

test('GET / returns API Portifolio online', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('message', 'API Portifolio online');
});
