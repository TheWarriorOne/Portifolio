// src/__tests__/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../components/Login'
import { vi } from 'vitest'

// mock do módulo api (default export)
const mockPost = vi.fn()
vi.mock('../services/api', () => ({
  default: {
    post: (...args) => mockPost(...args),
  }
}))

// mock useNavigate do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login component', () => {
  beforeEach(() => {
    mockPost.mockReset()
    mockNavigate.mockReset()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renders inputs and button', () => {
    render(<Login />)
    expect(screen.getByLabelText(/Seu Usuário/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sua Senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('successful login stores token and navigates to /decisao', async () => {
    // Arrange: mock post returns token
    mockPost.mockResolvedValueOnce({ data: { token: 'abc123' } })

    render(<Login />)
    const user = userEvent.setup()

    // Fill inputs
    await user.type(screen.getByLabelText(/Seu Usuário/i), 'teste@mail.com')
    await user.type(screen.getByLabelText(/Sua Senha/i), 'senha123')

    // Click remember checkbox (toggle)
    const remember = screen.getByLabelText(/Lembrar de mim/i)
    await user.click(remember)

    // Submit
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    // Wait for async logic
    await waitFor(() => {
      // navigation must have been called
      expect(mockNavigate).toHaveBeenCalledWith('/decisao')
    })

    // token saved in both storages when rememberMe true
    expect(localStorage.getItem('ecogram_token')).toBe('abc123')
    expect(localStorage.getItem('rememberedUsername')).toBe('teste@mail.com')
    expect(sessionStorage.getItem('ecogram_token')).toBe('abc123')
  })

  it('displays error message when api.post rejects', async () => {
    mockPost.mockRejectedValueOnce({ response: { data: { error: 'Credenciais inválidas' } } })

    render(<Login />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/Seu Usuário/i), 'bad@mail.com')
    await user.type(screen.getByLabelText(/Sua Senha/i), 'badpass')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText(/Credenciais inválidas/i)).toBeInTheDocument()
    })

    // no navigation on error
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
