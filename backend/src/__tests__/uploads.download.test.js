// backend/src/__tests__/uploads.download.test.js
import { jest } from '@jest/globals';

// mock db BEFORE importing app
jest.mock('../db.js', () => ({
  connectDB: async () => ({
    db: {
      collection: () => ({
        findOne: async (q) => {
          // retorna documento compatível com arquivo
          return {
            _id: 'fid123',
            filename: (q && q.filename) || 'teste.jpg',
            metadata: { mimeType: 'image/jpeg' }
          };
        }
      })
    },
    bucket: {
      openDownloadStream: (id) => {
        const { Readable } = require('stream');
        const s = new Readable();
        s._read = () => {};
        process.nextTick(() => { s.push('abc'); s.push(null); });
        return s;
      }
    }
  })
}));

import request from 'supertest';
import { app } from '../index.js';

test('GET /api/uploads/:identifier streams file (mocked)', async () => {
  const res = await request(app).get('/api/uploads/teste.jpg');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/image\/jpeg|application\/octet-stream/);
  // res.body é um Buffer para downloads; convertemos e checamos conteúdo
  expect(res.body).toBeDefined();
  const bodyStr = Buffer.isBuffer(res.body) ? res.body.toString('utf8') : String(res.body);
  expect(bodyStr).toContain('abc');
});
