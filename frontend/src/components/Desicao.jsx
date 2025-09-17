import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Estilo para animação de jump-in */}
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

      {/* Lado esquerdo: Gradiente + Logo + Ilustração */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-[#667eea] to-[#764ba2]">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">E-coGram</h1>
          <p className="text-lg font-medium mb-8">Gerencie seus produtos com facilidade</p>
          <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-6xl">📦</span>
          </div>
        </div>
      </div>

      {/* Lado direito: Botões principais */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Escolha uma ação</h2>
            <p className="text-gray-600 font-medium">Gerencie seus produtos abaixo</p>
          </div>

          {/* Botões principais */}
      <div className="flex flex-col space-y-6 items-center">
        <button
          onClick={() => navigate('/pesquisar')}
          className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg 
                     hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 space-x-3 w-64"
        >
          <Search size={20} />
          <span className="text-base font-medium">Pesquisar Produtos</span>
        </button>

        <button
          onClick={() => navigate('/app')} // Alterado de /cadastrar para /app
          className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg 
                     hover:bg-green-600 transition-all duration-300 transform hover:scale-105 space-x-3 w-64"
        >
          <Plus size={20} />
          <span className="text-base font-medium">Cadastrar Produtos</span>
        </button>
          </div>

          {/* Rodapé opcional */}
          <p className="text-center text-sm text-gray-500 font-medium mt-10">
            Voltar para{' '}
            <a
              href="/"
              className="text-primary hover:underline font-medium"
            >
              página inicial
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
