import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check if a user is already logged in when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
    <AuthContext.Provider value={{ user, login, registerUser,logout }}>
      {children}
    </AuthContext.Provider>
  );
};