import { useState } from 'react';
import axios from 'axios';

export default function UploadImage() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file || !codigo) {
      setMessage('Selecione um arquivo e informe o código');
      return;
    }
    const formData = new FormData();
    formData.append('image', file);
    formData.append('codigo', codigo);
    try {
      const res = await axios.post('http://localhost:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message);
      window.dispatchEvent(new Event('imageUploaded'));
    } catch (err) {
      console.error('Erro:', err.response?.data);
      setMessage('Erro no upload: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <input
        type="text"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Código do produto"
        className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
      />
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
