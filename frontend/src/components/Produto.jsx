import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Produto.css'; // Apenas o Produto.css

export default function Produto() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Estado para loading
  const [error, setError] = useState(null); // Estado para erros

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return; // Sai do useEffect se não autenticado
    }

    // Chamada real à API
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Resposta da API:', res.data); // Log completo da resposta
        if (Array.isArray(res.data)) {
          setProducts(res.data); // Define os produtos apenas se for array
        } else {
          console.error('Dados da API não são um array:', res.data);
          setProducts([]);
        }
      } catch (err) {
        console.error('Erro ao carregar produtos:', err.response ? err.response.data : err.message);
        setError('Erro ao carregar produtos. Verifique o servidor ou a conexão.');
      } finally {
        setLoading(false); // Finaliza o loading
      }
    };
    fetchProducts();
  }, [navigate]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleApprove = async (productId, imageName) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/approve`,
        { productId, imageName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Atualiza o estado local após aprovação (se necessário)
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productId ? { ...p, imagens: p.imagens.map(i => i === imageName ? { ...i, approved: true } : i) } : p
        )
      );
    } catch (err) {
      console.error('Erro ao aprovar imagem:', err);
      setError('Erro ao aprovar imagem.');
    }
  };

  const handleReject = async (productId, imageName) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/reject`,
        { productId, imageName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Atualiza o estado local após reprovação (se necessário)
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productId ? { ...p, imagens: p.imagens.map(i => i === imageName ? { ...i, rejected: true } : i) } : p
        )
      );
    } catch (err) {
      console.error('Erro ao rejeitar imagem:', err);
      setError('Erro ao rejeitar imagem.');
    }
  };

  const handleDelete = async (productId, imageName) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/images/${imageName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Atualiza o estado local removendo a imagem
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productId
            ? { ...p, imagens: p.imagens.filter((i) => i !== imageName) }
            : p
        ).filter((p) => p.imagens.length > 0) // Remove o produto se não houver mais imagens
      );
    } catch (err) {
      console.error('Erro ao deletar imagem:', err);
      setError('Erro ao deletar imagem.');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.id?.toString().includes(searchTerm) ||
    product.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para construir a URL da imagem
  const getImageUrl = (imageName) => {
    return `http://localhost:3000/uploads/${imageName}`; // Ajuste o caminho conforme necessário
  };

  return (
    <div className="produto-min-h-screen produto-flex produto-bg-gray-100" style={{ position: 'relative' }}>
      {/* Botão Voltar fixo no canto superior esquerdo */}
      <button onClick={() => navigate('/decisao')} className="produto-botao-voltar-top-left">
        Voltar
      </button>

      {/* Contêiner fixo para título e campo de busca */}
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

      {/* Tabela de produtos com cabeçalho fixo e corpo rolável */}
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
                <tr key={product._id?.$oid || product.id} className="produto-tr">
                  <td className="produto-td">{product.id || 'N/A'}</td>
                  <td className="produto-td">{product.descricao || 'Sem descrição'}</td>
                  <td className="produto-td">{product.grupo || 'Sem grupo'}</td>
                  <td className="produto-td">
                    <div className="produto-flex produto-gap-2 produto-flex-wrap">
                      {product.imagens && Array.isArray(product.imagens) && product.imagens.length > 0 ? (
                        product.imagens.map((image, index) => (
                          <div key={index} className="produto-image-container">
                            <img
                              src={getImageUrl(image)}
                              alt={`${product.descricao} - Imagem ${index + 1}`}
                              className="produto-product-img"
                              onClick={() => handleImageClick(getImageUrl(image))}
                              onError={(e) => console.log(`Erro ao carregar imagem: ${image}`, e)}
                            />
                            <div className="produto-image-actions">
                              <button
                                className="produto-action-btn produto-approve"
                                onClick={() => handleApprove(product.id, image)}
                              >
                                ✓
                              </button>
                              <button
                                className="produto-action-btn produto-reject"
                                onClick={() => handleReject(product.id, image)}
                              >
                                ✗
                              </button>
                              <button
                                className="produto-action-btn produto-delete"
                                onClick={() => handleDelete(product.id, image)}
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

      {/* Modal para visualizar imagem ampliada */}
      {selectedImage && (
        <div className="produto-modal-overlay" onClick={closeModal}>
          <div className="produto-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Imagem ampliada" className="produto-modal-img" />
            <button className="produto-close-modal" onClick={closeModal}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}