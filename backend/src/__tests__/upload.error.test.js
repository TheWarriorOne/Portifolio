// backend/src/__tests__/upload.nofile.test.js
import request from 'supertest';
import { jest } from '@jest/globals';

// NÃO precisamos mockar connectDB aqui — só testamos validação de arquivo ausente
import { app } from '../index.js';

test('POST /api/uploads sem arquivo retorna 400', async () => {
  const res = await request(app)
    .post('/api/uploads')
    // não attachamos arquivos de propósito
    .set('Accept', 'application/json');

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});
