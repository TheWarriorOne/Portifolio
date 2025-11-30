// src/__tests__/ImportProducts.test.jsx
/// <reference types="vitest" />
/* eslint-env vitest */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ImportProducts from '../components/ImportProducts'
import { vi } from 'vitest'

// mock api
const mockGet = vi.fn()
vi.mock('../services/api', () => ({
  default: {
    get: (...args) => mockGet(...args),
  }
}))

describe('ImportProducts component', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it('renders textarea and import button', async () => {
    mockGet.mockResolvedValueOnce({ data: [] })

    render(
      <MemoryRouter>
        <ImportProducts />
      </MemoryRouter>
    )

    const textarea = await screen.findByRole('textbox')
    expect(textarea).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: /importa|import/i })
    expect(btn).toBeInTheDocument()
  })

  it('processes import and shows results for found/approved images', async () => {
    const products = [
      { id: 111, descricao: 'Produto A', imagens: [{ approved: true }, { approved: false }] },
      { id: 222, descricao: 'Produto B', imagens: [] }
    ]

    mockGet.mockResolvedValueOnce({ data: products })

    render(
      <MemoryRouter>
        <ImportProducts />
      </MemoryRouter>
    )

    // espera carregamento inicial
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith('/products'))

    const textarea = screen.getByRole('textbox')
    const btn = screen.getByRole('button', { name: /importa|import/i })

    await userEvent.clear(textarea)
    await userEvent.type(textarea, '111\n999\n222')
    await userEvent.click(btn)

    await waitFor(() => {
      // MULTIPLAS ocorrências: textarea + tabela => usamos getAllByText
      expect(screen.getAllByText(/111/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/999/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/222/).length).toBeGreaterThan(0)

      // validar os títulos das tabelas usando role heading (aponta ao <h4>)
      expect(screen.getByRole('heading', { name: /Produtos importados/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Códigos ignorados/i })).toBeInTheDocument()
    })
  })
})
