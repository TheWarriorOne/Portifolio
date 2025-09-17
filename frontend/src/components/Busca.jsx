import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Busca() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/products?search=${search}`);
      setResults(res.data);
    } catch (err) {
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Busca de Produtos</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite o código do produto..."
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Buscar
          </button>
        </form>
      </div>
      {loading && <p className="text-center">Carregando...</p>}
      {results.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Resultados</h3>
          {results.map(([codigo, imgs]) => (
            <div key={codigo} className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Código: {codigo}</h4>
              <div className="grid grid-cols-3 gap-4">
                {imgs.map((img) => (
                  <img
                    key={img}
                    src={`http://localhost:3000/uploads/${img}`}
                    alt={`Imagem ${img}`}
                    className="w-32 h-32 object-cover rounded cursor-pointer"
                    onClick={() => navigate(`/produto/${codigo}/${img}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && !loading && search && (
        <p className="text-center text-gray-500">Nenhum resultado encontrado.</p>
      )}
    </div>
  );
}
