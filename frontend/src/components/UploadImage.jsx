import { useState } from 'react';
import axios from 'axios';

export default function UploadImage() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;
    console.log('Enviando arquivo:', file); // Adiciona log para depuração
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post('http://localhost:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message);
    } catch (err) {
      console.error('Erro:', err.response?.data);
      setMessage('Erro no upload: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <img src={preview} alt="preview" className="max-h-64 rounded-xl" />}
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Enviar
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}