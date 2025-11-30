// backend/src/__tests__/app.integration.test.js
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../index.js';         // import do app que exportamos
import { connectDB } from '../db.js';      // conecta ao Mongo (usa process.env.MONGO_URI)
import { jest } from '@jest/globals';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();

  // conecta o mongoose da sua aplicação ao mongo em memória
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test('GET / responds with ok', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('message', 'API Portifolio online');
});
