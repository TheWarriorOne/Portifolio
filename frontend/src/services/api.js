// frontend/src/services/api.js
import axios from 'axios';

const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const api = axios.create({
  baseURL: `${base}/api`, // deixa o frontend usar caminhos como api.get('/products')
  timeout: 15000,
});

// opcional: interceptors para injetar token se tiver auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // ou outro storage
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
