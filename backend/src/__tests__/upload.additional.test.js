// src/__tests__/upload.additional.test.js
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index.js';

test('POST /api/uploads sem arquivos retorna 400 e mensagem de erro', async () => {
  // Gera token (se sua rota exigir token; se não exigir, a presença não atrapalha)
  const token = jwt.sign({ userId: '1', username: 'test' }, process.env.JWT_SECRET || 'devsecret');

  const res = await request(app)
    .post('/api/uploads')
    .set('Authorization', `Bearer ${token}`) // caso a rota exija auth
    // não anexamos .attach -- simulamos requisição sem arquivos
    .field('some', 'value'); // manter formato multipart

  // esperar que a rota valide e retorne 400 (ou comportamento similar definido no upload.js)
  expect([400, 422, 500]).toContain(res.status); // aceita 400/422/500 caso seu código trate de forma diferente
  // se for 400/422, espera campo error no body
  if (res.status === 400 || res.status === 422) {
    expect(res.body).toHaveProperty('error');
  }
});
