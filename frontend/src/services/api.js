// frontend/src/services/api.js
import axios from 'axios';

// Base da API (Vite)
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Cria instância global
const api = axios.create({
  baseURL,
});

// Função para aplicar token após login
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Se houver token salvo, aplica automaticamente
if (typeof window !== "undefined") {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) setAuthToken(token);
}

export default api;
