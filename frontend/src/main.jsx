import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Produto from './components/Produto.jsx';
import App from './App.jsx';
import Decisao from './components/Decisao.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/decisao" element={<Decisao />} />
        <Route path="/app" element={<App />} />
        <Route path="/produto" element={<Produto />} />
        <Route path="/produto/:id/:img" element={<Produto />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
