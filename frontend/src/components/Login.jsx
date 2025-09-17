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
    try {
      const res = await axios.post('http://localhost:3000/login', {
        username,
        password,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/desicao');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Estilo para animação de salto */}
      <style>
        {`
          @keyframes jumpIn {
            0% {
              transform: scale(0.7);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
            }
          }
          .animate-jump-in {
            animation: jumpIn 0.4s ease-out;
          }
        `}
      </style>
      {/* Lado esquerdo: Gradiente e ilustração */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-[#667eea] to-[#764ba2]">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">E-coGram</h1>
          <p className="text-lg font-medium mb-8">Gerencie suas imagens com facilidade</p>
          <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-6xl">📸</span>
          </div>
        </div>
      </div>
      {/* Lado direito: Formulário */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo de volta!</h2>
            <p className="text-gray-600 font-medium">Faça login para continuar</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Campo Usuário */}
            <div className="mx-4">
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-1 text-center"
              >
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 text-gray-700 border-b-2 border-gray-300 focus:border-primary focus:outline-none 
                transition-colors duration-300 max-w-sm mx-auto block text-center"
                placeholder="Digite seu usuário"
                required
              />
            </div>
            {/* Campo Senha */}
            <div className="mx-4 max-w-sm mx-auto">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-1 text-center"
              >
                Senha
              </label>
              <div className="relative max-w-sm mx-auto">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-2 text-gray-700 border-b-2 border-gray-300 focus:border-primary focus:outline-none 
                  transition-colors duration-300 pr-10 max-w-sm mx-auto block text-center"
                  placeholder="Digite sua senha"
                  required
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 left-1/2 translate-x-[calc(280%)] 
                    -translate-y-1/2 text-gray-500 hover:text-primary"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>
            {/* Ações */}
            <div className="flex flex-col items-center mt-8 space-y-2 mb-6">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-primary focus:ring-primary" 
                />
                <span className="ml-2 text-sm text-gray-600 font-medium">
                  Lembrar de mim
                </span>
              </label>
              <a 
                href="#" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Esqueceu a senha?
              </a>
            </div>
            <div className="botao-entrar"> {/* Substituído mt-12 por botao-entrar */}
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white p-3 rounded-lg hover:bg-primaryHover 
                transition-colors duration-300 transform hover:scale-105 disabled:bg-gray-400 
                disabled:transform-none max-w-md mx-auto block text-center"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
          {/* Pop-up de Erro no Estilo Windows */}
          {error && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              role="dialog"
              aria-labelledby="error-title"
            >
              <div className="bg-gray-200 border-2 border-gray-400 max-w-sm w-full mx-4 animate-jump-in">
                {/* Barra de título */}
                <div className="bg-blue-600 text-white p-2 flex justify-between items-center">
                  <h3 id="error-title" className="text-sm font-bold">Erro</h3>
                </div>
                {/* Conteúdo do modal */}
                <div className="p-6">
                  <p className="text-red-600 text-sm text-center font-medium mb-6">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="w-full bg-gray-300 text-black p-2 border border-gray-400 hover:bg-gray-400 transition-colors duration-300"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Rodapé */}
          <p className="text-center text-sm text-gray-500 font-medium mt-6">
            Não tem conta?{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}