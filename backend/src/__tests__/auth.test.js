// src/__tests__/auth.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { app } from '../index.js';

afterEach(() => jest.clearAllMocks());

test('POST /api/register creates user', async () => {
  User.findOne = jest.fn().mockResolvedValue(null);
  User.create = jest.fn().mockResolvedValue({ _id: 'u1' });

  const res = await request(app).post('/api/register').send({ username: 'x', password: 'p' });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('id');
  expect(User.create).toHaveBeenCalled();
});

test('POST /api/register returns 400 if missing data', async () => {
  const res = await request(app).post('/api/register').send({ username: '' });
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});

test('POST /api/login returns token on success', async () => {
  const hash = bcrypt.hashSync('pass', 10);
  User.findOne = jest.fn().mockResolvedValue({ _id: 'u1', username: 'u', password: hash });

  const res = await request(app).post('/api/login').send({ username: 'u', password: 'pass' });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('token');
});

test('POST /api/login invalid credentials returns 401', async () => {
  User.findOne = jest.fn().mockResolvedValue(null);

  const res = await request(app).post('/api/login').send({ username: 'no', password: 'x' });
  expect(res.status).toBe(401);
  expect(res.body).toHaveProperty('error');
});
