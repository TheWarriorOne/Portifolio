import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Produto from './components/Produto.jsx';
import App from './App.jsx';
import Decisao from './components/Decisao.jsx';
import ImportProducts from './components/ImportProducts.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* PÚBLICA */}
        <Route path="/" element={<Login />} />

        {/* ROTAS PROTEGIDAS */}
        <Route path="/decisao" element={
          <PrivateRoute>
            <Decisao />
          </PrivateRoute>
        } />

        <Route path="/app" element={
          <PrivateRoute>
            <App />
          </PrivateRoute>
        } />

        <Route path="/produto" element={
          <PrivateRoute>
            <Produto />
          </PrivateRoute>
        } />

        <Route path="/produto/:id/:img" element={
          <PrivateRoute>
            <Produto />
          </PrivateRoute>
        } />

        <Route path="/import" element={
          <PrivateRoute>
            <ImportProducts />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  </React.StrictMode>
);
