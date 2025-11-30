// vitest.setup.js
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import * as react from 'react'

// expõe React global para evitar "React is not defined"
globalThis.React = react

// simples polyfill para localStorage/sessionStorage (correto sintaxe)
const createStorage = () => {
  let store = {}
  return {
    getItem(k) { return k in store ? store[k] : null },
    setItem(k, v) { store[k] = String(v) },
    removeItem(k) { delete store[k] },
    clear() { store = {} },
  }
}
globalThis.localStorage = createStorage()
globalThis.sessionStorage = createStorage()

// Mock consistente para axios que fornece `default.create()` e named create
vi.mock('axios', async (importOriginal) => {
  // tenta manter exports originais caso existam
  const actual = await importOriginal().catch(() => ({}))

  const mockedInstance = {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  }

  return {
    default: {
      ...(actual.default || {}),
      create: () => mockedInstance
    },
    create: () => mockedInstance,
    // preserva outros exports se houver
    ...(actual && typeof actual === 'object' ? actual : {})
  }
})
