// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token =
    localStorage.getItem('ecogram_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('ecogramToken') ||
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('ecogram_token') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('ecogramToken') ||
    sessionStorage.getItem('auth_token');

  if (!token || token === 'null' || token === '') {
    return <Navigate to="/" replace />;
  }

  return children;
}
