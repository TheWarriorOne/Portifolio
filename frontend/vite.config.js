// vite.config.ts (exemplo mínimo)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',                       // <-- usar 'v8' é simples e confiável
      reporter: ['text', 'html', 'lcov'],
      extension: ['.ts', '.tsx', '.js', '.jsx'],
      all: true,
      include: ['src/**/*'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
    }
  }
})
