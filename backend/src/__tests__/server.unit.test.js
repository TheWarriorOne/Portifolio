// src/__tests__/server.unit.test.js
import { jest } from '@jest/globals';

let listenMock;
let originalConsoleLog;
let originalConsoleError;

beforeAll(async () => {
  // silencia logs para não poluir o runner
  originalConsoleLog = console.log;
  originalConsoleError = console.error;
  console.log = jest.fn();
  console.error = jest.fn();

  // mock do listen (não abre porta real)
  listenMock = jest.fn((port, cb) => { if (typeof cb === 'function') cb(); });

  // mock do app (cobre export default ou named)
  try {
    await jest.unstable_mockModule('../app.js', () => ({
      default: { listen: listenMock },
      app: { listen: listenMock }
    }));
  } catch (err) {
    // ignora se Jest/E2E não suportar unstable_mockModule no ambiente
  }

  try {
    await jest.unstable_mockModule('../index.js', () => ({
      default: { listen: listenMock },
      app: { listen: listenMock }
    }));
  } catch (err) {
    // ignora
  }

  // mock do DB para evitar conexão real
  try {
    await jest.unstable_mockModule('../db.js', () => ({
      connectDB: async () => ({ db: {}, bucket: {} }),
      getBucket: () => ({})
    }));
  } catch (err) {
    // ignora
  }

  // importa o server (que deve executar e chamar o listen mockado)
  try {
    await import('../server.js');
  } catch (err) {
    // se import falhar, restaura logs e re-throw para vermos o erro no CI local
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    throw err;
  }
});

afterAll(() => {
  // restaura console
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  jest.resetAllMocks();
  jest.clearAllMocks();
});

test('server chama app.listen ao importar server.js', () => {
  expect(listenMock).toHaveBeenCalled();
  const calledWith = listenMock.mock.calls[0]?.[0];
  expect(typeof calledWith === 'number' || typeof calledWith === 'string').toBe(true);
});
