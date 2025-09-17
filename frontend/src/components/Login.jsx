import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Tentando login com:', { username, password });
    try {
      const res = await axios.post('http://localhost:3000/login', {
        username,
        password,
      });
      console.log('Resposta do login:', res.data);
      localStorage.setItem('token', res.data.token);
      navigate('/app');
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo: Gradiente */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-[#667eea] to-[#764ba2] items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold">Portifolio</h1>
          <p className="mt-2 text-lg font-medium">Gerencie suas imagens com facilidade</p>
        </div>
      </div>
      {/* Lado direito: Formulário */}
      <div className="flex w-full lg:w-1/2 items-center justify-center">
        <div className="w-full max-w-md login-card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Bem-vindo de volta!</h2>
            <p className="text-gray-500 mt-2 font-medium">Faça login para continuar</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuário */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <div className="relative mt-1">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 text-gray-700"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>
            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 text-gray-700"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {/* Ações */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary" />
                <span className="ml-2 text-sm text-gray-600 font-medium">Lembrar de mim</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline font-medium">
                Esqueceu a senha?
              </a>
            </div>
            {/* Erro */}
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full transition-transform transform hover:scale-105 disabled:bg-gray-400"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          {/* Divisor */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm font-medium">ou</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          {/* Login Social */}
          <div className="flex justify-center gap-4">
            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.649,9.486-11.453H12.545z"
                />
              </svg>
            </button>
            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M9.9,18.55l-0.07-5.48h-1.7V10.1h1.7V8.24c0-1.71,1.04-2.64,2.56-2.64c0.73,0,1.36,0.05,1.54,0.07v1.78h-1.06c-0.83,0-0.99,0.39-0.99,0.97v1.27h1.98l-0.26,2.97h-1.72l0.07,5.48c-2.94-0.47-5.25-2.98-5.32-6.06C4.58,9.07,6.89,6.56,9.9,6.09V18.55z"
                />
              </svg>
            </button>
          </div>
          {/* Rodapé */}
          <p className="text-center text-sm text-gray-500 mt-6 font-medium">
            Não tem conta?{' '}
            <a href="#" className="text-primary hover:underline">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
