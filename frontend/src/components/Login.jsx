import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

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
      navigate('/decisao');
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
          <h1 className="animate-jump-in">
            Bem vindo <br/> ao <br />E-coGram
          </h1>
          <p className="sub-title text-md font-medium mb-8">
            Gerencie suas imagens com facilidade
          </p>
          <div>
            <img src="/images/nova-imagem.jpg" alt="Ícone E-coGram" className="imgcapa" />
          </div>
        </div>
      </div>
          {/* Lado direito: Formulário */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="login-title">Login</h2> {/* Substitui text-3xl font-bold text-gray-800 mb-2 */}
            <p className="login-subtitle">Entre para gerenciar suas imagens</p> {/* Substitui text-gray-500 text-sm */}
          </div>
          <form onSubmit={handleSubmit} className="login-form space-y-6">
            {/* Campo Usuário */}
            <div className="mx-4">
              <label htmlFor="username" className="login-label">
                Seu Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
                placeholder="nome@mail.com.br"
                required
              />
            </div>
            {/* Campo Senha */}
            <div className="mx-4">
              <label htmlFor="password" className="login-label">
                Sua Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder="1234"
                  required
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn absolute right-3 top-55% -translate-y-1/2 text-gray-500 hover:text-primary transition-colors duration-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>
            {/* Ações */}
            <div className="mx-4 login-actions">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="login-actions" />
                <span className="login-actions">Lembrar de mim</span>
              </label>
            </div>
            <div className="botao-entrar mx-4">
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
          {/* Pop-up de Erro no Estilo Windows */}
            {error && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                <div className="bg-gray-200 border-2 border-gray-400 max-w-sm w-full mx-auto animate-jump-in error-popup">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-2 flex justify-center items-center rounded-t-lg">
                    <h3 id="error-title" className="text-sm font-bold text-center">Erro</h3>
                  </div>
                  <div className="p-6 flex flex-col justify-center items-center">
                    <p className="text-red-600 text-sm text-center font-medium mb-6">{error}</p>
                    <button
                      onClick={() => setError('')}
                      className="w-full bg-gray-300 text-black p-2 border border-gray-400 hover:bg-gray-400 transition-colors duration-300 rounded-md shadow-md"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}            
        </div>
      </div>
    </div>
  );
}