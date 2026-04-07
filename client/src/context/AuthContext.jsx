import { useState } from 'react';
import api from '../api';
import { AuthContext } from './authContextCore';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (phoneNumber, password) => {
    try {
      // Talk to the backend!
      const response = await api.post('/auth/login', { phoneNumber, password });
      
      // Save the user and token to local storage so they stay logged in
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      return response.data; // Return data to let the Login page know it worked
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // NEW: Registration Function
  const registerUser = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
