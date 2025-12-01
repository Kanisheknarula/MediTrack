import axios from 'axios';

// This line is crucial. It checks the Vercel environment variable first.
// If VITE_API_URL is undefined, it falls back to localhost (which is what is happening to you).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log("🔗 API Base URL:", API_URL); // This will show up in your browser console for debugging

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;