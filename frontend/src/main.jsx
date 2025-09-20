import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Pesquisa from './components/Pesquisa.jsx';
import Produto from './components/Produto.jsx';
import App from './App.jsx';
import Desicao from './components/Desicao.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/desicao" element={<Desicao />} />
        <Route path="/app" element={<App />} />
        <Route path="/pesquisar" element={<Pesquisa />} />
        <Route path="/produto/:id/:img" element={<Produto />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);