import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import App from './App.jsx';
import Busca from './components/Busca.jsx';
import Produto from './components/Produto.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<App />} />
        <Route path="/busca" element={<Busca />} />
        <Route path="/produto/:codigo/:img" element={<Produto />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
