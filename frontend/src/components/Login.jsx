import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Carrega usuário lembrado e estado do checkbox ao montar
  useEffect(() => {
    const savedUser = localStorage.getItem('rememberedUsername');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/login`, {
        username,
        password,
      });

      const token = res.data?.token;
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('rememberedUsername', username);
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
        localStorage.removeItem('rememberedUsername');
      }

      navigate('/decisao');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <style>{`
        @keyframes jumpIn {
          0% { transform: scale(0.7); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-jump-in { animation: jumpIn 0.4s ease-out; }
      `}</style>

      <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-[#667eea] to-[#764ba2]">
        <div className="text-center text-white">
          <h1 className="animate-jump-in">Bem vindo <br/> ao <br/> E-coGram</h1>
          <p className="sub-title text-md font-medium mb-8">Gerencie suas imagens com facilidade</p>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="login-title">Login</h2>
            <p className="login-subtitle">Entre para gerenciar suas imagens</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form space-y-6">
            <div className="mx-4">
              <label htmlFor="username" className="login-label">Seu Usuário</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="login-input" placeholder="nome@mail.com.br" required />
            </div>

            <div className="mx-4">
              <label htmlFor="password" className="login-label">Sua Senha</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" placeholder="1234" required />
                {password && (
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>

            <div className="mx-4 login-actions">
              <label htmlFor="remember" className="flex items-center space-x-2">
                <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span>Lembrar de mim</span>
              </label>
            </div>

            <div className="botao-entrar mx-4">
              <button type="submit" disabled={loading} className="login-button">{loading ? 'Entrando...' : 'Entrar'}</button>
            </div>
          </form>

          {error && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
              <div className="bg-gray-200 border-2 border-gray-400 max-w-sm w-full mx-auto animate-jump-in error-popup">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-2 flex justify-center items-center rounded-t-lg">
                  <h3 className="text-sm font-bold text-center">Erro</h3>
                </div>
                <div className="p-6 flex flex-col justify-center items-center">
                  <p className="text-red-600 text-sm text-center font-medium mb-6">{error}</p>
                  <button onClick={() => setError('')} className="w-full bg-gray-300 text-black p-2 border border-gray-400 hover:bg-gray-400 transition-colors duration-300 rounded-md shadow-md">OK</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
