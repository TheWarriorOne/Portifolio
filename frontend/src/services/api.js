import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Em dev, usa o backend local real
// Em produção, usa o domínio do front (CloudFront) com behavior /api/*
const BASE = isLocal
  ? 'http://localhost:3000'
  : import.meta.env.VITE_API_URL || window.location.origin;

const API_BASE = `${BASE}/api`;

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
