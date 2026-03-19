import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Points to your Node.js server!
});

// Automatically attach the token if it exists in local storage
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;