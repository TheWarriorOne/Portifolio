// backend/src/__tests__/upload.download.mock.test.js
import request from 'supertest';
import { Readable } from 'stream';
import { jest } from '@jest/globals';

// mock connectDB para servir um arquivo e um bucket com openDownloadStream
jest.mock('../db.js', () => {
  const makeReadable = () => {
    const r = new Readable();
    r.push('abc');
    r.push(null);
    return r;
  };

  return {
    connectDB: jest.fn().mockResolvedValue({
      db: {
        collection: () => ({
          // findOne retorna documento compatível com findFile()
          findOne: async (q) => ({
            _id: 'fakeid123',
            filename: 'teste.jpg',
            metadata: { mimeType: 'image/jpeg' }
          })
        })
      },
      bucket: {
        openDownloadStream: (id) => makeReadable()
      }
    })
  };
});

import { app } from '../index.js';

test('GET /api/uploads/:identifier streams file (mocked bucket)', async () => {
  const res = await request(app).get('/api/uploads/teste.jpg');

  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/image\/jpeg|application\/octet-stream/);

  // para resposta binária checar res.body (Buffer)
  expect(res.body).toBeDefined();
  expect(Buffer.isBuffer(res.body)).toBe(true);
  expect(res.body.toString()).toContain('abc');
});
