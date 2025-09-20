import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';

export default function Pesquisa() {
  const [id, setId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [grupo, setGrupo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!id && !descricao && !grupo) {
      setError('Preencha pelo menos um campo para buscar.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const queryParams = {};
      if (id) queryParams.id = id;
      if (descricao) queryParams.descricao = descricao;
      if (grupo) queryParams.grupo = grupo;
      const query = new URLSearchParams(queryParams).toString();
      console.log('Enviando requisição para:', `http://localhost:3000/products?${query}`);
      const res = await axios.get(`http://localhost:3000/products?${query}`);
      console.log('Resposta recebida:', res.data);
      const results = Array.isArray(res.data) ? res.data : [];
      if (results.length > 0) {
        const firstProduct = results[0];
        const img = firstProduct.imagens && firstProduct.imagens.length > 0 ? firstProduct.imagens[0] : 'default.jpg';
        navigate(`/produto/${firstProduct.id}/${img}`);
      } else {
        setError('Nenhum resultado encontrado.');
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError(err.response?.data?.error || 'Erro ao buscar produtos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Estilo para animação de salto (mesmo do login) */}
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
      {/* Lado esquerdo: Gradiente roxo-azul */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-[#667eea] to-[#764ba2]">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">E-coGram</h1>
          <p className="text-lg font-medium mb-8">Gerenciador de Imagens</p>
          <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
            <Search size={48} />
          </div>
        </div>
      </div>
      {/* Lado direito: Formulário */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Pesquisar Produtos</h2>
            <p className="text-gray-600 font-medium">Busque por Código, Nome ou Grupo</p>
          </div>
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Campo Código */}
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Código
              </label>
              <input
                id="id"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Digite o código do produto"
                className="p-2 text-gray-700 border-b-2 border-gray-300 focus:border-primary focus:outline-none 
                transition-colors duration-300 pr-10 max-w-sm mx-auto block text-center"
              />
            </div>
            {/* Campo Nome */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Nome
              </label>
              <input
                id="descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Digite o nome (ex: Furadeira)"
                className="p-2 text-gray-700 border-b-2 border-gray-300 focus:border-primary focus:outline-none 
                transition-colors duration-300 pr-10 max-w-sm mx-auto block text-center"
              />
            </div>
            {/* Campo Grupo */}
            <div>
              <label htmlFor="grupo" className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Grupo
              </label>
              <input
                id="grupo"
                type="text"
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                placeholder="Digite o grupo"
                className="p-2 text-gray-700 border-b-2 border-gray-300 focus:border-primary focus:outline-none 
                transition-colors duration-300 pr-10 max-w-sm mx-auto block text-center"
              />
            </div>
            <div className="botao-pesquisar"></div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white p-3 rounded-lg hover:bg-primaryHover 
              transition-colors duration-300 transform hover:scale-105 disabled:bg-gray-400 
              disabled:transform-none flex items-center justify-center space-x-2 mx-auto"
            >
              <Search size={20} />
              <span>{loading ? 'Pesquisando...' : 'Pesquisar'}</span>
            </button>
          </form>
          {/* Modal de erro estilo Windows */}
          {error && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              role="dialog"
              aria-labelledby="error-title"
            >
              <div className="bg-gray-200 border-2 border-gray-400 max-w-sm w-full mx-4 animate-jump-in">
                <div className="bg-blue-600 text-white p-2 flex justify-between items-center">
                  <h3 id="error-title" className="text-sm font-bold">Erro</h3>
                </div>
                <div className="p-6">
                  <p className="text-red-600 text-sm text-center font-medium mb-6">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="w-full bg-gray-300 text-black p-2 border border-gray-400 hover:bg-gray-400 
                    transition-colors duration-300"
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