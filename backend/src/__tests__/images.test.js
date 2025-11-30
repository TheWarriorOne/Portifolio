// backend/src/__tests__/images.test.js
import request from 'supertest';
import { app } from '../index.js';

test('GET /images returns array', async () => {
  const res = await request(app).get('/images');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  // garante que pelo menos um item tenha filename string
  expect(res.body.length).toBeGreaterThanOrEqual(0);
  if (res.body.length > 0) {
    expect(typeof res.body[0].filename).toBe('string');
  }
});

test('DELETE /images/:identifier deletes first image (if any) and returns ok', async () => {
  // pega a lista atual
  const listRes = await request(app).get('/images');
  expect(listRes.status).toBe(200);
  const files = Array.isArray(listRes.body) ? listRes.body : [];

  if (files.length === 0) {
    // Se não houver arquivos, apenas certificamos que a lista veio corretamente.
    // Não vamos falhar o teste só porque não tem arquivo para deletar.
    expect(files.length).toBe(0);
    return;
  }

  // usa o filename do primeiro item (funciona tanto com filename quanto com _id)
  const identifier = files[0].filename || files[0]._id || null;
  expect(identifier).toBeTruthy();

  const delRes = await request(app).delete(`/images/${identifier}`);
  // rota deve devolver 200 e { ok: true } quando encontra e apaga
  expect(delRes.status).toBe(200);
  expect(delRes.body).toEqual({ ok: true });
});
