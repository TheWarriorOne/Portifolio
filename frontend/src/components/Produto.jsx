import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Produto.css';

export default function Produto() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== Novos estados =====
  const [confirmData, setConfirmData] = useState(null); // { productId, imageName }
  const [toast, setToast] = useState({ show: false, text: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }

    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
      console.error(err);
      setError('Erro ao carregar produtos. Verifique o servidor ou a conexão.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [navigate]);

  const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
  const closeModal = () => setSelectedImage(null);

  // ===== Aprovar / Rejeitar (inalterado) =====
  const handleApprove = async (productId, imageName) => {
    try {
      const token = localStorage.getItem('token');
      const product = products.find(p => p.id === productId);
      const image = product.imagens.find(img => img.name === imageName);
      const action = image.approved ? 'unapprove' : 'approve';

      await axios.post('http://localhost:3000/approve',
        { productId, imageName, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get('http://localhost:3000/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch {
      setError('Erro ao aprovar/desaprovar imagem.');
    }
  };

  const handleReject = async (productId, imageName) => {
    try {
      const token = localStorage.getItem('token');
      const product = products.find(p => p.id === productId);
      const image = product.imagens.find(img => img.name === imageName);
      const action = image.rejected ? 'unreject' : 'reject';

      await axios.post('http://localhost:3000/approve',
        { productId, imageName, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get('http://localhost:3000/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch {
      setError('Erro ao rejeitar/desrejeitar imagem.');
    }
  };

  // ===== Excluir: abre confirmação =====
  const askDelete = (productId, imageName) => {
    setConfirmData({ productId, imageName });
  };

  // ===== Confirma exclusão =====
  const confirmDelete = async () => {
  const { productId, imageName } = confirmData;
  setConfirmData(null);

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3000/images/${imageName}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Atualiza localmente imediatamente ✅
    setProducts(prev =>
      prev
        .map(p =>
          p.id === productId
            ? { ...p, imagens: p.imagens.filter(i => i.name !== imageName) }
            : p
        )
        .filter(p => p.imagens?.length > 0)
    );

    setToast({ show: true, text: 'Imagem excluída com sucesso!' });
    setTimeout(() => setToast({ show: false, text: '' }), 2000);
  } catch {
    setError('Erro ao deletar imagem.');
  }
};


  const cancelDelete = () => setConfirmData(null);

  const filteredProducts = products.filter((product) =>
    product.id?.toString().includes(searchTerm) ||
    product.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (imageName) => `http://localhost:3000/uploads/${imageName}`;

  return (
    <div className="produto-min-h-screen produto-flex produto-bg-gray-100" style={{ position: 'relative' }}>
      <button onClick={() => navigate('/decisao')} className="produto-botao-voltar-top-left">
        Voltar
      </button>

      {/* ===== Toast ===== */}
      {toast.show && (
        <div className={`produto-toast ${toast.show ? '' : 'hide'}`}>
          {toast.text}
        </div>
      )}

      {/* Cabeçalho fixo + busca */}
      <div className="produto-fixed-header">
        <div className="produto-text-center produto-mb-8">
          <h2 className="produto-text-3xl produto-font-bold produto-text-gray-800">E-coGram</h2>
        </div>
        <div className="produto-search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por ID ou descrição"
            className="produto-form-input"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="produto-table-container">
        {loading ? (
          <p className="produto-text-gray-500 produto-text-center">Carregando produtos...</p>
        ) : error ? (
          <p className="produto-text-red-500 produto-text-center">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="produto-text-gray-500 produto-text-center">Nenhum produto encontrado.</p>
        ) : (
          <table className="produto-table">
            <thead className="produto-thead">
              <tr>
                <th className="produto-th">ID</th>
                <th className="produto-th">Descrição</th>
                <th className="produto-th">Grupo</th>
                <th className="produto-th">Imagens</th>
              </tr>
            </thead>
            <tbody className="produto-tbody">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="produto-tr">
                  <td className="produto-td">{product.id || 'N/A'}</td>
                  <td className="produto-td">{product.descricao || 'Sem descrição'}</td>
                  <td className="produto-td">{product.grupo || 'Sem grupo'}</td>
                  <td className="produto-td">
                    <div className="produto-flex produto-gap-2 produto-flex-wrap">
                      {Array.isArray(product.imagens) && product.imagens.length > 0 ? (
                        product.imagens.map((image, index) => (
                          <div
                            key={`${product.id}-${image.name}`}
                            className="produto-image-container"
                          >
                            <img
                              src={getImageUrl(image.name)}
                              alt={`${product.descricao} - Imagem ${index + 1}`}
                              className="produto-product-img"
                              onClick={() => handleImageClick(getImageUrl(image.name))}
                            />
                            <div className="produto-image-actions">
                              <button
                                className={`produto-action-btn produto-approve ${image.approved ? 'selected' : ''}`}
                                onClick={() => handleApprove(product.id, image.name)}
                              >
                                ✓
                              </button>
                              <button
                                className={`produto-action-btn produto-reject ${image.rejected ? 'selected' : ''}`}
                                onClick={() => handleReject(product.id, image.name)}
                              >
                                ✗
                              </button>
                              <button
                                className="produto-action-btn produto-delete"
                                onClick={() => askDelete(product.id, image.name)} // <- abre modal
                                title="Excluir imagem"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="produto-text-gray-500">Sem imagens</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== Modal de preview da imagem ===== */}
      {selectedImage && (
        <div className="produto-modal-overlay" onClick={closeModal}>
          <div className="produto-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Preview" className="produto-modal-img" />
            <button className="produto-close-modal" onClick={closeModal}>✕</button>
          </div>
        </div>
      )}

      {/* ===== Modal de confirmação de exclusão ===== */}
      {confirmData && (
        <div className="produto-confirm-overlay" onClick={cancelDelete}>
          <div className="produto-confirm-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1f2937' }}>
              Excluir esta imagem?
            </h3>
            <p style={{ color: '#6b7280', marginTop: '.5rem' }}>
              Esta ação não pode ser desfeita.
            </p>
            <div className="produto-confirm-actions">
              <button className="produto-btn produto-btn-danger" onClick={confirmDelete}>
                Sim, excluir
              </button>
              <button className="produto-btn produto-btn-neutral" onClick={cancelDelete}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
