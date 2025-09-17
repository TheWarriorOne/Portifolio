import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const fetchImages = async () => {
    try {
      const res = await axios.get('http://localhost:3000/products');
      console.log('Resposta do backend:', res.data);
      // Corrigido: Ajustar para a estrutura retornada pelo backend
      const products = Array.isArray(res.data) ? res.data : [];
      const imageList = products.flatMap(product => 
        product.imagens.map(img => ({
          id: product.id,
          img,
          descricao: product.descricao || 'Sem descrição',
          grupo: product.grupo || 'Sem grupo',
        }))
      );
      setImages(imageList);
    } catch (err) {
      console.error('Erro ao buscar imagens:', err);
    }
  };

  useEffect(() => {
    fetchImages();
    window.addEventListener('imageUploaded', fetchImages);
    return () => window.removeEventListener('imageUploaded', fetchImages);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Galeria de Imagens</h2>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={`${image.id}-${image.img}`} className="border p-2 rounded-lg">
            <img
              src={`http://localhost:3000/uploads/${image.img}`}
              alt={`Imagem ${image.id}`}
              className="w-full h-32 object-cover rounded-lg cursor-pointer"
              onClick={() => navigate(`/produto/${image.id}/${image.img}`)}
            />
            <p>ID: {image.id}</p>
            <p>Descrição: {image.descricao}</p>
            <p>Grupo: {image.grupo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}