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
    const product = products.find(p => p.id === productId);
    const image = product.imagens.find(img => img.name === imageName);
    const action = image.approved ? 'unapprove' : 'approve'; // Reverte se já aprovado

    await axios.post(
      `http://localhost:3000/approve`,
      { productId, imageName, action },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const res = await axios.get('http://localhost:3000/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Dados retornados pelo GET /products:', res.data);
    setProducts(res.data);
  } catch (err) {
    console.error('Erro ao aprovar/desaprovar imagem:', err);
    setError('Erro ao aprovar/desaprovar imagem.');
  }
};

const handleReject = async (productId, imageName) => {
  try {
    const token = localStorage.getItem('token');
    const product = products.find(p => p.id === productId);
    const image = product.imagens.find(img => img.name === imageName);
    const action = image.rejected ? 'unreject' : 'reject'; // Reverte se já rejeitado

    await axios.post(
      `http://localhost:3000/approve`,
      { productId, imageName, action },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const res = await axios.get('http://localhost:3000/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Dados retornados pelo GET /products:', res.data);
    setProducts(res.data);
  } catch (err) {
    console.error('Erro ao rejeitar/desrejeitar imagem:', err);
    setError('Erro ao rejeitar/desrejeitar imagem.');
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
        prevProducts
          .map((p) =>
            p.id === productId
              ? { ...p, imagens: p.imagens.filter((i) => i.name !== imageName) }
              : p
          )
          .filter((p) => p.imagens.length > 0) // Remove o produto se não houver mais imagens
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

  const getImageUrl = (imageName) => {
    return `http://localhost:3000/uploads/${imageName}`;
  };

  return (
    <div className="produto-min-h-screen produto-flex produto-bg-gray-100" style={{ position: 'relative' }}>
      <button onClick={() => navigate('/decisao')} className="produto-botao-voltar-top-left">
        Voltar
      </button>

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
                <tr key={product._id?.$oid || product.id} className="produto-tr">
                  <td className="produto-td">{product.id || 'N/A'}</td>
                  <td className="produto-td">{product.descricao || 'Sem descrição'}</td>
                  <td className="produto-td">{product.grupo || 'Sem grupo'}</td>
                  <td className="produto-td">
                    <div className="produto-flex produto-gap-2 produto-flex-wrap">
                      {product.imagens && Array.isArray(product.imagens) && product.imagens.length > 0 ? (
                        product.imagens.map((image, index) => (
                          <div key={`${product.id}-${image.name}`} className="produto-image-container">
                            <img
                              src={getImageUrl(image.name)}
                              alt={`${product.descricao} - Imagem ${index + 1}`}
                              className="produto-product-img"
                              onClick={() => handleImageClick(getImageUrl(image.name))}
                              onError={(e) => console.log(`Erro ao carregar imagem: ${image.name}`, e)}
                            />
                            <div className="produto-image-actions">
                              <button
                                key={`${product.id}-${image.name}-approve`}
                                className={`produto-action-btn produto-approve ${image.approved ? 'selected' : ''}`}
                                onClick={() => handleApprove(product.id, image.name)}
                                onMouseOver={() => console.log('Botão Approve:', image.name, 'approved:', image.approved)}
                              >
                                ✓
                              </button>
                              <button
                                key={`${product.id}-${image.name}-reject`}
                                className={`produto-action-btn produto-reject ${image.rejected ? 'selected' : ''}`}
                                onClick={() => handleReject(product.id, image.name)}
                                onMouseOver={() => console.log('Botão Reject:', image.name, 'rejected:', image.rejected)}
                              >
                                ✗
                              </button>
                              <button
                                key={`${product.id}-${image.name}-delete`}
                                className="produto-action-btn produto-delete"
                                onClick={() => handleDelete(product.id, image.name)}
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