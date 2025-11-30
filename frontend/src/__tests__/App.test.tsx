import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

test('renderiza o título principal da página', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  )

  // procura o heading principal (h1/h2/h3) com o texto "Cadastro de Produto"
  const heading = screen.getByRole('heading', { name: /cadastro de produto/i })
  expect(heading).toBeInTheDocument()
})
