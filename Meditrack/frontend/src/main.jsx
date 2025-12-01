import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Your global styles
// import axios from 'axios';

// 1. Import the Chakra Provider
import { ChakraProvider } from '@chakra-ui/react';

// This is your live Render server URL
//axios.defaults.baseURL = 'https://meditrack-server-fmx9.onrender.com';

//axios.defaults.baseURL =
//import.meta.env.VITE_API_URL || 'https://meditrack-server-fmx9.onrender.com';
// axios.defaults.baseURL = 'http://localhost:5000';

// This is your interceptor for the token
// axios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// This is the ONLY ReactDOM.createRoot section you need
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap your <App /> with the provider */}
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);