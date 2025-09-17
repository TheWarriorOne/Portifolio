import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';

export default function Pesquisa() {
  const [id, setId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [grupo, setGrupo] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!id && !descricao && !grupo) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({ id, descricao, grupo }).toString();
      const res = await axios.get(`http://localhost:3000/products?${query}`);
      setResults(res.data);
    } catch (err) {
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#a3a1be] p-8 font-sans">
      <div className="text-center mt-4">
        <h1 className="text-4xl font-bold text-[#00008b] mb-2">E-co Gram</h1>
        <h2 className="text-3xl text-[#00008b] mb-8">Gerenciador de Imagens</h2>
      </div>
      <div className="w-[90%] mx-auto bg-[#b2b4ff] border-2 border-[#00008b] rounded-lg p-5">
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label className="block font-bold text-[#00008b] mb-1">ID:</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Digite o ID do produto"
              className="w-full p-5 border border-gray-300 rounded-md focus:outline-none focus:border-[#00008b]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#00008b] mb-1">Descrição:</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Digite a descrição"
              className="w-full p-5 border border-gray-300 rounded-md focus:outline-none focus:border-[#00008b]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#00008b] mb-1">Grupo:</label>
            <input
              type="text"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Digite o grupo"
              className="w-full p-5 border border-gray-300 rounded-md focus:outline-none focus:border-[#00008b]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[#00008b] text-white py-2.5 rounded-md hover:bg-[#0000cc] transition-all duration-300 disabled:bg-gray-400 flex items-center justify-center space-x-2"
          >
            <Search size={20} />
            <span>Pesquisar</span>
          </button>
        </form>
      </div>
      {loading && <p className="text-center text-[#00008b] mt-4">Carregando...</p>}
      {results.length > 0 && (
        <div className="w-[66.5%] mx-auto mt-2 bg-[#b2b4ff] border-2 border-[#00008b] rounded-lg p-5">
          <h3 className="text-xl font-bold text-[#00008b] mb-4">Resultados</h3>
          {results.map((product) => (
            <div key={product.id} className="mb-4">
              <h4 className="text-lg font-semibold text-[#00008b] mb-2">
                ID: {product.id} | Descrição: {product.descricao} | Grupo: {product.grupo}
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {product.imagens.map((img) => (
                  <img
                    key={img}
                    src={`http://localhost:3000/uploads/${img}`}
                    alt={`Imagem ${img}`}
                    className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-all duration-300"
                    onClick={() => navigate(`/produto/${product.id}/${img}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && (id || descricao || grupo) && !loading && (
        <p className="text-center text-[#00008b] mt-4">Nenhum resultado encontrado.</p>
      )}
    </div>
  );
}