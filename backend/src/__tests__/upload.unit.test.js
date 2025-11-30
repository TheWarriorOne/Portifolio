/**
 * upload.unit.test.js
 * Unit tests for upload logic: mock GridFS bucket and multer behavior.
 */

import request from 'supertest';
import { app } from '../index.js';
import { Readable } from 'stream';
import { jest } from '@jest/globals';

// mock connectDB bucket or the module that exports bucket
jest.mock('../db.js', () => {
  // keep connectDB real if you want, but mock the bucket used by upload.js
  const original = jest.requireActual('../db.js');
  return {
    ...original,
    getBucket: () => ({
      openUploadStream: jest.fn(() => {
        // return a writable-like stream mock with events
        const w = new (require('stream').Writable)({
          write(chunk, enc, cb) { cb(); }
        });
        // emulate .id and .length
        w.id = 'mockedId';
        w.length = 123;
        // simulate finish event after nextTick
        process.nextTick(() => w.emit('finish'));
        return w;
      })
    })
  };
});

describe('Upload unit (mock bucket)', () => {
  test('POST /api/uploads without file returns 400', async () => {
    const res = await request(app).post('/api/uploads');
    expect(res.status).toBe(400);
  });

  test('POST /api/uploads with file returns 201 when bucket writes', async () => {
    // build multipart/form-data with supertest
    const res = await request(app)
      .post('/api/uploads')
      .set('Authorization', 'Bearer faketoken') // if route uses auth; adjust
      .attach('images', Buffer.from('abc'), 'test.jpg');

    // depending on your handler, adapt expectations
    expect([200,201]).toContain(res.status);
    // if body contains fileId:
    // expect(res.body).toHaveProperty('fileId');
  });
});
