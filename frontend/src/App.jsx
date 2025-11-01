import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

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
    <div className="app-min-h-screen app-flex app-bg-gray-100">
      {/* Container centralizado */}
      <div className="app-container app-animate-jump-in">
        {/* Título */}
        <div className="app-text-center app-mb-8">
          <h2 className="app-text-3xl app-font-bold app-text-gray-800">Cadastro de Produto</h2>
          <p className="app-text-gray-600 app-font-medium">Adicione um novo produto e suas imagens</p>
        </div>

        {/* Formulário de Cadastro */}
        <div className="app-form-container">
          <div className="app-flex app-flex-col app-gap-4">
            <label className="app-form-label">Código (ID):</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ID do produto"
              className="app-form-input"
              required
            />
            <label className="app-form-label">Descrição:</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do produto"
              className="app-form-input"
            />
            <label className="app-form-label">Grupo:</label>
            <input
              type="text"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Grupo do produto"
              className="app-form-input"
            />
            <label className="app-form-label">Upload de Imagens (selecione quantas quiser):</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="app-form-input"
            />
            <div className="app-flex app-gap-4 app-mb-4">
              <button onClick={handleUpload} className="app-submit-button">
                Enviar
              </button>
              <button onClick={handleClear} className="app-submit-button">
                Limpar
              </button>
            </div>
            {message && <p className="app-text-red-500 app-mt-2">{message}</p>}
          </div>
        </div>

        {/* Pré-visualização das Imagens */}
        <div className="app-preview-container">
          <h3 className="app-text-2xl app-font-bold app-mb-4 app-text-gray-800 app-text-center">
            Pré-visualização das Imagens
          </h3>
          {previews.length === 0 ? (
            <p className="app-text-gray-500 app-text-center">Nenhuma imagem selecionada ainda.</p>
          ) : (
            <div className="app-preview-grid">
              {previews.map((preview, index) => (
                <div key={index} className="app-preview-cell">
                  <img src={preview} alt={`Preview ${index}`} className="app-preview-img" />
                  <button
                    onClick={() => removeImage(index)}
                    className="app-remove-button"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/decisao')}
        className="app-botao-voltar"
      >
        Voltar
      </button>
    </div>
  );
}