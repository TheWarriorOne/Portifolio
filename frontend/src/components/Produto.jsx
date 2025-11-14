import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Produto.css';

const ItemTypes = { IMAGE: 'image' };

function DraggableImage({
  productId,
  productDesc,
  image,
  index,
  moveImage,
  onDropPersist,
  onApprove,
  onReject,
  onAskDelete,
  getImageUrl,
  onPreview,
}) {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.IMAGE,
    item: { index, productId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: () => {
      onDropPersist(productId);
    },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.IMAGE,
    hover: (dragged, monitor) => {
      if (dragged.productId !== productId) return;
      if (dragged.index === index) return;
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const middleX = (rect.right - rect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientX = clientOffset.x - rect.left;

      if (dragged.index < index && hoverClientX < middleX) return;
      if (dragged.index > index && hoverClientX > middleX) return;

      moveImage(productId, dragged.index, index);
      dragged.index = index;
    },
    drop: () => ({ productId }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="produto-image-container"
      style={{ opacity: isDragging ? 0.6 : 1 }}
      title="Arraste para reordenar"
    >
      <img
        src={getImageUrl(image)}
        alt={`${productDesc}`}
        className="produto-product-img"
        onClick={() => onPreview(getImageUrl(image))}
      />
      <div className="produto-image-actions">
        <button
          className={`produto-action-btn produto-approve ${image.approved ? 'selected' : ''}`}
          onClick={() => onApprove(productId, image.name)}
          title={image.approved ? 'Desmarcar aprovado' : 'Aprovar'}
        >
          ✓
        </button>
        <button
          className={`produto-action-btn produto-reject ${image.rejected ? 'selected' : ''}`}
          onClick={() => onReject(productId, image.name)}
          title={image.rejected ? 'Desmarcar rejeitado' : 'Rejeitar'}
        >
          ✗
        </button>
        <button
          className="produto-action-btn produto-delete"
          onClick={() => onAskDelete(productId, image.name)}
          title="Excluir"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Produto() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmData, setConfirmData] = useState(null);
  const [toast, setToast] = useState({ show: false, text: '' });

  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;

  const api = axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  useEffect(() => {
    const t = token;
    if (!t) {
      navigate('/');
      return;
    }
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        if (mounted) setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar produtos. Verifique o servidor ou a conexão.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const getImageUrl = (image) => {
    if (!image) return '';
    // image pode ser objeto { gridFsId, name } ou string
    if (typeof image === 'string') {
      return `${API_BASE}/uploads/${image}`;
    }
    const id = image.gridFsId || image.name || '';
    return id ? `${API_BASE}/uploads/${id}` : '';
  };

  // Aprovar / Rejeitar
  const handleApprove = async (productId, imageName) => {
    try {
      const product = products.find((p) => p.id === productId);
      const img = product?.imagens.find((i) => i.name === imageName);
      const action = img?.approved ? 'unapprove' : 'approve';
      await api.post('/approve', { productId, imageName, action });
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {
      console.error(e);
      setError('Erro ao aprovar/desaprovar imagem.');
    }
  };

  const handleReject = async (productId, imageName) => {
    try {
      const product = products.find((p) => p.id === productId);
      const img = product?.imagens.find((i) => i.name === imageName);
      const action = img?.rejected ? 'unreject' : 'reject';
      await api.post('/approve', { productId, imageName, action });
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {
      console.error(e);
      setError('Erro ao rejeitar/desrejeitar imagem.');
    }
  };

  // Excluir
  const askDelete = (productId, imageName) => setConfirmData({ productId, imageName });

  const confirmDelete = async () => {
    const { productId, imageName } = confirmData;
    setConfirmData(null);
    try {
      await api.delete(`/images/${imageName}`);
      setProducts((prev) =>
        prev
          .map((p) =>
            p.id === productId ? { ...p, imagens: p.imagens.filter((i) => i.name !== imageName) } : p
          )
          .filter((p) => (Array.isArray(p.imagens) ? p.imagens.length > 0 : true))
      );
      setToast({ show: true, text: 'Imagem excluída com sucesso!' });
      setTimeout(() => setToast({ show: false, text: '' }), 2000);
    } catch (e) {
      console.error(e);
      setError('Erro ao deletar imagem.');
    }
  };
  const cancelDelete = () => setConfirmData(null);

  // Reordenação UI
  const moveImage = useCallback((productId, from, to) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const arr = [...(p.imagens || [])];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        return { ...p, imagens: arr };
      })
    );
  }, []);

  // Persistir ordem
  const persistOrder = async (productId) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product || !Array.isArray(product.imagens)) return;
      const newOrder = product.imagens.map((img) => img.name);
      await api.put(`/products/${productId}/order`, { order: newOrder });
      setToast({ show: true, text: 'Ordem atualizada!' });
      setTimeout(() => setToast({ show: false, text: '' }), 1200);
    } catch (e) {
      console.error(e);
      setError('Não foi possível salvar a nova ordem.');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.id?.toString().includes(searchTerm) ||
      p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="produto-min-h-screen produto-flex produto-bg-gray-100" style={{ position: 'relative' }}>
        <button onClick={() => navigate('/decisao')} className="produto-botao-voltar-top-left">
          Voltar
        </button>

        {toast.show && <div className="produto-toast">{toast.text}</div>}

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
                            <DraggableImage
                              key={`${product.id}-${image.name}`}
                              productId={product.id}
                              productDesc={product.descricao}
                              image={image}
                              index={index}
                              moveImage={moveImage}
                              onDropPersist={persistOrder}
                              onApprove={handleApprove}
                              onReject={handleReject}
                              onAskDelete={askDelete}
                              getImageUrl={getImageUrl}
                              onPreview={(url) => setSelectedImage(url)}
                            />
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

        {selectedImage && (
          <div className="produto-modal-overlay" onClick={() => setSelectedImage(null)}>
            <div className="produto-modal-content" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage} alt="Preview" className="produto-modal-img" />
              <button className="produto-close-modal" onClick={() => setSelectedImage(null)}>
                ✕
              </button>
            </div>
          </div>
        )}

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
    </DndProvider>
  );
}
