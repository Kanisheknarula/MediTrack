import axios from 'axios';

// This reads the URL you set in Vercel Environment Variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/sessions if you use them
});

export default api;