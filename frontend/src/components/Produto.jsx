import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './Produto.css';

export default function Produto() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [grupo, setGrupo] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImgIndex, setModalImgIndex] = useState(0);
  const [modalProductImgs, setModalProductImgs] = useState([]);

  // Busca produtos
const handleSearch = async (e) => {
  e.preventDefault();
  try {
    const params = new URLSearchParams();
    if (id) params.append('id', id);
    if (descricao) params.append('descricao', descricao);
    if (grupo) params.append('grupo', grupo);

    const res = await axios.get(`http://localhost:3000/products?${params.toString()}`);
    const arr = Array.isArray(res.data) ? res.data : [];
    console.log('Dados recebidos:', arr); // Depuração
    setProducts(arr);
    if (arr.length === 0) setError('Nenhum resultado encontrado.');
    else setError('');
  } catch (err) {
    console.error('Erro na busca:', err);
    setError(err.response?.data?.error || 'Erro ao buscar produtos.');
  }
};

  // Abre modal da galeria
  const openModal = (images, index) => {
    setModalProductImgs(images);
    setModalImgIndex(index);
    setModalOpen(true);
  };

  // Navegar imagens
  const prevImage = () => {
    setModalImgIndex((prev) => (prev === 0 ? modalProductImgs.length - 1 : prev - 1));
  };
  const nextImage = () => {
    setModalImgIndex((prev) => (prev === modalProductImgs.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate('/decisao')}
          className="submit-button flex items-center space-x-2"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-800">E-coGram</h1>
          <p className="text-sm text-gray-500">Gerenciador de Imagens</p>
        </div>
      </div>

      {/* Formulário de pesquisa */}
      <form
        onSubmit={handleSearch}
        className="search-form"
      >
        <div className="form-fields">
          <div className="form-field">
            <label htmlFor="id" className="form-label">Código:</label>
            <input
              id="id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Digite o código"
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label htmlFor="descricao" className="form-label">Descrição:</label>
            <input
              id="descricao"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Digite a descrição"
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label htmlFor="grupo" className="form-label">Grupo:</label>
            <input
              id="grupo"
              type="text"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Digite o grupo"
              className="form-input"
            />
          </div>
        </div>
        <div className="form-submit">
          <button
            type="submit"
            className="submit-button"
          >
            Pesquisar
          </button>
        </div>
      </form>

      {/* Resultado */}
      <div className="max-w-6xl mx-auto">
        {error && <p className="text-center text-red-600 font-medium mb-4">{error}</p>}

        {products.length > 0 && (
          <div className="overflow-x-auto max-w-6xl mx-auto bg-white rounded-xl shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Código</th>
                  <th className="px-4 py-2 text-left">Descrição</th>
                  <th className="px-4 py-2 text-left">Grupo</th>
                  <th className="px-4 py-2 text-left">Imagens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{p.id}</td>
                    <td className="px-4 py-2">{p.descricao}</td>
                    <td className="px-4 py-2">{p.grupo}</td>
                    <td className="px-4 py-2">
                      {p.imagens && p.imagens.length > 0 ? (
                        <div className="flex gap-2">
                          {p.imagens.map((imgName, index) => (
                            <img
                              key={index}
                              src={`http://localhost:3000/uploads/${imgName}`}
                              alt={p.descricao || 'Imagem'}
                              className="h-12 w-12 object-cover rounded border cursor-pointer"
                              onClick={() => openModal(p.imagens, index)}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Sem imagem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal da galeria */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div className="relative flex items-center justify-center">
            {/* Botão anterior */}
            <button
              className="absolute left-0 text-white p-2"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft size={30} />
            </button>

            <img
              src={modalProductImgs[modalImgIndex]}
              alt="Ampliação"
              className="max-h-[50vh] max-w-[50vw] rounded shadow-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Botão próximo */}
            <button
              className="absolute right-0 text-white p-2"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight size={30} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
