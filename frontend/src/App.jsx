import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadImage from './components/UploadImage.jsx';
import Gallery from './components/Gallery.jsx';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/'); // Redireciona para login se não autenticado
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Portifolio</h1>
      <UploadImage />
      <Gallery />
      <button
        onClick={() => navigate('/produto')}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Ir para Busca
      </button>
    </div>
  );
}