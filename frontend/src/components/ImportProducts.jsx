import { useEffect, useState } from 'react';
import api from '../services/api';
import './ImportProducts.css';
import { useNavigate } from 'react-router-dom'; // ✅ import do useNavigate

export default function ImportProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // ✅ inicialização

  // buscar produtos (cache local)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/products');
        if (mounted) setAllProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        if (mounted) setError('Erro ao buscar produtos do servidor.');
      }
    })();

    return () => { mounted = false; };
  }, []);

  // limpa e normaliza os códigos do usuário
  const parseCodes = (text) => {
    if (!text) return [];
    const parts = text
    .split(/[\n,;|\s\t]+/)
    .map(s => s.trim())
    .filter(Boolean);

    const unique = [];
    const seen = new Set();
    for (const p of parts) {
      if (!seen.has(p)) {
        seen.add(p);
        unique.push(p);
      }
    }
    return unique.slice(0, 50);
  };

  const handleImportFake = async () => {
    setError(null);
    setResult(null);

    const codes = parseCodes(inputText);
    if (codes.length === 0) {
      setError('Insira até 50 códigos separados por nova linha, vírgula ou espaço) (;)');
      return;
    }
    if (codes.length > 50) {
      setError('Máximo 50 códigos por importação.');
      return;
    }

    setProcessing(true);

    try {
      const imported = [];
      const skipped = [];

      const productsMap = new Map(allProducts.map(p => [String(p.id), p]));

      for (const code of codes) {
        const prod = productsMap.get(String(code));
        if (!prod) {
          skipped.push({ code, reason: 'Produto não encontrado' });
          continue;
        }
        const approvedImages = Array.isArray(prod.imagens)
          ? prod.imagens.filter(img => img.approved)
          : [];

        if (approvedImages.length === 0) {
          skipped.push({ code, reason: 'Sem imagens aprovadas' });
          continue;
        }

        imported.push({
          code: prod.id,
          descricao: prod.descricao || '',
          imagesImported: approvedImages.length,
        });
      }

      setResult({ imported, skipped, timestamp: new Date().toISOString() });

    } catch (err) {
      console.error(err);
      setError('Erro durante a importação (veja o console).');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="import-wrap">

      {/* ✅ Botão voltar */}
      <button className="btn-ghost back-btn" onClick={() => navigate('/Decisao')}>
        Voltar
      </button>

      <h2>Importar produtos para e-commerce</h2>

      <div className="import-card">
        <label>Coloque até 50 códigos separados por nova linha, vírgula ou espaço:</label>
        <textarea
          className="import-input"
          placeholder="Ex.: 100001,100002,100003,"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={1200}
          rows={6}
        />

        <div className="import-actions">
          <button
            className="btn-primary"
            onClick={handleImportFake}
            disabled={processing}
          >
            {processing ? 'Importando...' : 'Importar para E-commerce'}
          </button>

          <button
            className="btn-ghost"
            onClick={() => { setInputText(''); setResult(null); setError(null); }}
            disabled={processing}
          >
            Limpar
          </button>
        </div>

        {error && <div className="import-error">{error}</div>}

        {result && (
          <div className="import-result">
            <div className="fake-message">
              ✅ Produtos importados com sucesso — <strong>{result.imported.length}</strong> produtos.
              <div className="timestamp">({new Date(result.timestamp).toLocaleString()})</div>
            </div>

            <div className="result-tables">
              <div className="table-block">
                <h4>Produtos importados</h4>
                {result.imported.length === 0 ? (
                  <p className="muted">Nenhum produto importado.</p>
                ) : (
                  <table>
                    <thead>
                      <tr><th>Código</th><th>Descrição</th><th>Qtd imagens importadas</th></tr>
                    </thead>
                    <tbody>
                      {result.imported.map((p) => (
                        <tr key={p.code}>
                          <td>{p.code}</td>
                          <td>{p.descricao}</td>
                          <td style={{ textAlign: 'center' }}>{p.imagesImported}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="table-block">
                <h4>Códigos ignorados</h4>
                {result.skipped.length === 0 ? (
                  <p className="muted">Nenhum código ignorado.</p>
                ) : (
                  <table>
                    <thead>
                      <tr><th>Código</th><th>Motivo</th></tr>
                    </thead>
                    <tbody>
                      {result.skipped.map((s) => (
                        <tr key={s.code + '-' + s.reason}>
                          <td>{s.code}</td>
                          <td>{s.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
