/// <reference types="vitest" />
import { test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute.jsx'

test('Não renderiza conteúdo protegido quando não há token', () => {
  localStorage.removeItem('ecogram_token')
  sessionStorage.removeItem('ecogram_token')

  const { queryByTestId } = render(
    <MemoryRouter initialEntries={['/rota-protegida']}>
      <PrivateRoute>
        <div data-testid="conteudo-protegido">OK</div>
      </PrivateRoute>
    </MemoryRouter>
  )

  // espera que conteúdo protegido NÃO esteja presente
  expect(queryByTestId('conteudo-protegido')).toBeNull()
})

test('Renderiza conteúdo protegido quando token existe', () => {
  localStorage.setItem('ecogram_token', 'abc123')

  const { getByTestId } = render(
    <MemoryRouter>
      <PrivateRoute>
        <div data-testid="ok">OK</div>
      </PrivateRoute>
    </MemoryRouter>
  )

  expect(getByTestId('ok')).toBeInTheDocument()
  localStorage.removeItem('ecogram_token')
})
