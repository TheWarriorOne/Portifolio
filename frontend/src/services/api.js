// services/api.js
import axios from 'axios';

const envBase = import.meta.env.VITE_API_URL || '';
const BASE = (envBase || window.location.origin).replace(/\/$/, '');
const API_BASE = `${BASE}/api`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const skipAuthPaths = ['/login', '/register', '/forgot-password'];
  const urlPath = config.url ? config.url.toString() : '';
  const isAuthRoute = skipAuthPaths.some(p => urlPath.endsWith(p) || urlPath.includes(p));

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
