// src/__tests__/upload.integration.test.js
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';

jest.mock('../db.js', () => ({
  connectDB: async () => ({
    db: {
      collection: (name) => ({
        find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
        findOne: async () => null
      })
    },
    bucket: {
      openUploadStream: (filename) => {
        const { Writable } = require('stream');
        const w = new Writable({ write(chunk, enc, cb) { cb(); } });
        w.id = 'mocked-id';
        w.length = 3;
        process.nextTick(() => w.emit('finish'));
        return w;
      }
    }
  }),
  getBucket: () => ({
    openUploadStream: (filename) => {
      const { Writable } = require('stream');
      const w = new Writable({ write(chunk, enc, cb) { cb(); } });
      w.id = 'mocked-id';
      w.length = 3;
      process.nextTick(() => w.emit('finish'));
      return w;
    }
  })
}));

import { app } from '../index.js';
import mongoose from 'mongoose';

jest.setTimeout(30000);

test('POST /api/uploads funciona com token (mock DB)', async () => {
  const token = jwt.sign({ userId: '1', username: 'admin' }, process.env.JWT_SECRET || 'devsecret');

  const res = await request(app)
    .post('/api/uploads')
    .set('Authorization', `Bearer ${token}`)
    .attach('images', Buffer.from('abc'), 'teste.jpg');

  expect([200, 201]).toContain(res.status);
  expect(res.body).toHaveProperty('uploaded');
});

afterAll(async () => {
  // garantir que mongoose não mantenha handle aberto (se conectado)
  try { await mongoose.disconnect(); } catch (e) {}
});
