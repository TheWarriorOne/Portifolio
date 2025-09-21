import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css'; // Certifique-se de que os estilos estão importados

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/'); // Redireciona para login se não autenticado
  }, [navigate]);

  const [files, setFiles] = useState([]); // Array de arquivos selecionados
  const [previews, setPreviews] = useState([]); // Array de URLs de preview
  const [id, setId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [grupo, setGrupo] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // Converte para array
    setFiles((prev) => [...prev, ...selectedFiles]); // Adiciona ao existente
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length || !id) {
      setMessage('Selecione pelo menos uma imagem e informe o ID');
      return;
    }
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file)); // Envia múltiplas imagens
    formData.append('id', id);
    formData.append('descricao', descricao || 'Sem descrição');
    formData.append('grupo', grupo || 'Sem grupo');
    
    try {
      const res = await axios.post('http://localhost:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message);
      setFiles([]);
      setPreviews([]);
      setId('');
      setDescricao('');
      setGrupo('');
      setTimeout(() => setMessage(''), 5000); // Limpa mensagem após 5s
    } catch (err) {
      console.error('Erro:', err.response?.data);
      setMessage('Erro no upload: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleClear = () => {
    setFiles([]);
    setPreviews([]);
    setId('');
    setDescricao('');
    setGrupo('');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Lado esquerdo: Formulário de Cadastro */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Cadastro de Produto</h2>
          <div className="flex flex-col gap-4">
            <label className="form-label">Código (ID):</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ID do produto"
              className="form-input w-custom-2 h-custom-2" // Ajuste largura e altura aqui
              required
            />
            <label className="form-label">Descrição:</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do produto"
              className="form-input w-custom-2 h-custom-2"
            />
            <label className="form-label">Grupo:</label>
            <input
              type="text"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Grupo do produto"
              className="form-input w-custom-2 h-custom-2"
            />
            <label className="form-label">Upload de Imagens (selecione quantas quiser):</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="form-input w-custom-2 h-custom-2"
            />
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleUpload}
                className="form-button bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Enviar
              </button>
              <button
                onClick={handleClear}
                className="form-button bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Limpar
              </button>
            </div>
            {message && <p className="mt-2 text-red-500">{message}</p>}
          </div>
        </div>
      </div>
      {/* Lado direito: Pré-visualização das Imagens */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-[#667eea] to-[#764ba2]">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Pré-visualização das Imagens</h2>
          {previews.length === 0 ? (
            <p className="text-gray-500 text-center">Nenhuma imagem selecionada ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview} alt={`Preview ${index}`} className="max-h-48 rounded-xl object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => navigate('/decisao')}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Voltar
      </button>
    </div>
  );
}