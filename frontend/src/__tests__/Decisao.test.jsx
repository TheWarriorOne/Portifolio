/// <reference types="vitest" />
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { test, expect } from 'vitest'
import Decisao from '../components/Decisao.jsx'

// não importamos api aqui porque não é usado no teste

test('Renderiza botões principais da tela Decisão', () => {
  render(
    <MemoryRouter>
      <Decisao />
    </MemoryRouter>
  )

  expect(screen.getByText('Pesquisar Produtos')).toBeInTheDocument()
  expect(screen.getByText('Cadastrar Produtos')).toBeInTheDocument()
  expect(screen.getByText('Importar E-comm')).toBeInTheDocument()
})
