import { useParams, useNavigate } from 'react-router-dom';

export default function Produto() {
  const { id, img } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button
        onClick={() => navigate('/pesquisar')}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Voltar
      </button>
      <h2 className="text-2xl font-bold mb-4">Detalhes do Produto: {id}</h2>
      <img
        src={`http://localhost:3000/uploads/${img}`}
        alt={`Imagem ${img}`}
        className="max-w-full h-auto rounded-lg"
      />
    </div>
  );
}