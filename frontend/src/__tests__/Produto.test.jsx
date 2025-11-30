/// <reference types="vitest" />
import { test, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Produto from '../components/Produto.jsx'
import api from '../services/api.js'

vi.mock('../services/api.js')

test('Renderiza título da tela de produtos (E-coGram)', async () => {
  api.get = api.get || vi.fn()
  api.get.mockResolvedValue({ data: { products: [] } })

  render(
    <MemoryRouter>
      <Produto />
    </MemoryRouter>
  )

  // header "E-coGram" existe no DOM que você mostrou
  await waitFor(() => {
    expect(screen.getByText(/e-coGram|e-cogram/i)).toBeInTheDocument()
  })
})

test('Mostra mensagem "Nenhum produto encontrado." quando não há produtos', async () => {
  api.get = api.get || vi.fn()
  api.get.mockResolvedValue({ data: { products: [] } })

  render(
    <MemoryRouter>
      <Produto />
    </MemoryRouter>
  )

  await waitFor(() => {
    expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument()
  })
})
