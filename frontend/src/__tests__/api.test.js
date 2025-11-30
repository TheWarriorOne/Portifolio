// src/__tests__/api.test.js
import api from '../services/api'
import { describe, it, expect } from 'vitest'

describe('api module smoke tests', () => {
  it('should export an object with http methods (get/post)', () => {
    expect(api).toBeDefined()
    // api created from axios.create() should at least have 'get' and 'post'
    expect(typeof api.get).toBe('function')
    expect(typeof api.post).toBe('function')
  })
})
