import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function Produto() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [grupo, setGrupo] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  // busca produtos conforme filtros
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      if (id) params.append('id', id);
      if (descricao) params.append('descricao', descricao);
      if (grupo) params.append('grupo', grupo);

      const res = await axios.get(`http://localhost:3000/products?${params.toString()}`);
      const arr = Array.isArray(res.data) ? res.data : [];
      setProducts(arr);
      if (arr.length === 0) setError('Nenhum resultado encontrado.');
      else setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao buscar produtos.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/pesquisar')}
          className="flex items-center space-x-2 text-primary hover:text-primaryHover font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        {/* Logo / Nome */}
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-800">E-coGram</h1>
          <p className="text-sm text-gray-500">Gerenciador de Imagens</p>
        </div>
      </div>

      {/* Formulário de Pesquisa */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl shadow p-6 max-w-4xl mx-auto mb-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
              Código:
            </label>
            <input
              id="id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Digite o código"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição:
            </label>
            <input
              id="descricao"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Digite a descrição"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="grupo" className="block text-sm font-medium text-gray-700 mb-1">
              Grupo:
            </label>
            <input
              id="grupo"
              type="text"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Digite o grupo"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primaryHover transition-colors duration-300"
          >
            Pesquisar
          </button>
        </div>
      </form>

      {/* Resultado da Pesquisa */}
      <div className="max-w-6xl mx-auto">
        {error && (
          <p className="text-center text-red-600 font-medium mb-4">{error}</p>
        )}

        {products.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Código</th>
                  <th className="px-4 py-2 text-left">Descrição</th>
                  <th className="px-4 py-2 text-left">Grupo</th>
                  <th className="px-4 py-2 text-left">Usuário</th>
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-left">Imagem</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">{p.id}</td>
                    <td className="px-4 py-2">{p.descricao}</td>
                    <td className="px-4 py-2">{p.grupo}</td>
                    <td className="px-4 py-2">{p.usuario_nome}</td>
                    <td className="px-4 py-2">
                      {p.data ? new Date(p.data).toLocaleDateString('pt-BR') : ''}
                    </td>
                    <td className="px-4 py-2">
                      {p.imagem && (
                        <img
                          src={`http://localhost:3000/uploads/${p.imagem}`}
                          alt={p.descricao || 'Imagem'}
                          className="h-20 rounded shadow"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
