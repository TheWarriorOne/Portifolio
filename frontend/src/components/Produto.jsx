import { useParams, useNavigate } from 'react-router-dom';

export default function Produto() {
  const { codigo, img } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button onClick={() => navigate('/busca')} className="mb-4 bg-gray-500 text-white px-4 py-2 rounded">
        Voltar
      </button>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Produto: {codigo}</h2>
        <img src={`http://localhost:3000/uploads/${img}`} alt={`Produto ${codigo}`} className="max-w-2xl rounded shadow-lg" />
      </div>
    </div>
  );
}
