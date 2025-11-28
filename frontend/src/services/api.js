// src/services/api.js
import axios from 'axios';

const envBase = import.meta.env.VITE_API_URL || '';
let BASE = envBase || window.location.origin;
BASE = BASE.replace(/\/$/, ''); // remove trailing slash
const API_BASE = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

// opcional: log para debug (remova depois)
console.log('[api] BASE:', BASE);
console.log('[api] API_BASE:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const skipAuthPaths = ['/login', '/register', '/forgot-password'];
  const urlPath = config.url || '';
  const isAuthRoute = skipAuthPaths.some(p => urlPath.includes(p));
  if (!isAuthRoute) {
    const token = localStorage.getItem('ecogram_token') || sessionStorage.getItem('ecogram_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
