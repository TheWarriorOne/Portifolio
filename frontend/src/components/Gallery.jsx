import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Gallery() {
  const [images, setImages] = useState([]);

  const fetchImages = async () => {
    try {
      const res = await axios.get('http://localhost:3000/products');
      const allImages = res.data.flatMap(([_, imgs]) => imgs);
      setImages(allImages);
    } catch (err) {
      console.error('Erro ao buscar imagens:', err);
    }
  };

  useEffect(() => {
    fetchImages();
    window.addEventListener('imageUploaded', fetchImages);
    return () => window.removeEventListener('imageUploaded', fetchImages);
  }, []);

  const handleDelete = async (img) => {
    try {
      await axios.delete(`http://localhost:3000/images/${img}`);
      fetchImages();
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Galeria</h2>
      <div className="grid grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img} className="relative">
            <img
              src={`http://localhost:3000/uploads/${img}`}
              alt={img}
              className="w-32 h-32 object-cover rounded"
            />
            <button
              onClick={() => handleDelete(img)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
