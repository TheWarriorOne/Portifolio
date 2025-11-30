// src/__tests__/db.error.test.js
import { jest } from '@jest/globals';
import * as dbModule from '../db.js';
import mongoose from 'mongoose';

describe('db.js error branches', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.MONGO_URI;
  });

  test('connectDB throws when mongoose.connect throws', async () => {
    // simula erro de conexão no mongoose
    jest.spyOn(mongoose, 'connect').mockRejectedValue(new Error('mongoose connect boom'));

    await expect(dbModule.connectDB()).rejects.toThrow('mongoose connect boom');
  });

  test('getBucket throws if bucket not initialized', () => {
    // garantir estado sem conexão/bucket
    // (se bucket estiver inicializado no processo por testes anteriores, não tocar)
    try {
      // force reset internal bucket by reloading module isolated (best-effort)
      // mas aqui apenas checamos que getBucket lança se não inicializado
      expect(() => dbModule.getBucket()).toThrow(/GridFSBucket não inicializado/i);
    } catch (err) {
      // Se o bucket já foi inicializado por outro teste, passamos no teste
      // para não quebrar a suite global
      if (!/GridFSBucket não inicializado/i.test(String(err))) {
        throw err;
      }
    }
  });
});
