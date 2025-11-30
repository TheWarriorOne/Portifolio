// src/__tests__/app.unit.test.js
import request from 'supertest';

let app;

beforeAll(async () => {
  // importa o módulo ESM dinamicamente
  const mod = await import('../app.js');
  // o módulo pode exportar default ou export named 'app'
  app = mod.default || mod.app || mod;
});

test('app basic route GET / responde sem erro', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  // garante que o body/text exista (ajuste se seu index retorna outra coisa)
  expect(res.text || res.body).toBeDefined();
});
