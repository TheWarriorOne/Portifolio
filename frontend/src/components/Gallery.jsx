import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Gallery() {
  const [images, setImages] = useState([]);

  const fetchImages = async () => {
    const res = await axios.get('http://localhost:3000/images');
    setImages(res.data);
  };

  const deleteImage = async (name) => {
    await axios.delete(`http://localhost:3000/images/${name}`);
    setImages(images.filter(img => img !== name));
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((img) => (
        <div key={img} className="relative group">
          <img
            src={`http://localhost:3000/uploads/${img}`}
            alt={img}
            className="rounded-xl shadow-md"
          />
          <button
            onClick={() => deleteImage(img)}
            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}
