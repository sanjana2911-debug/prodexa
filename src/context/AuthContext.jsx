/**
 * AuthContext provides authentication state management
 * Uses real backend API for login, register, and profile management
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('prodexa_token'));

  // Check for saved session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('prodexa_token');
      if (savedToken) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data.user);
        } catch (err) {
          localStorage.removeItem('prodexa_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login(email, password);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('prodexa_token', newToken);
      setToken(newToken);
      setUser(userData);
      setLoading(false);
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
      setLoading(false);
      return false;
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register(name, email, password);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('prodexa_token', newToken);
      setToken(newToken);
      setUser(userData);
      setLoading(false);
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('prodexa_token');
  };

  const updateProfile = async (updates) => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(updates);
      setUser(prev => ({ ...prev, ...res.data.user }));
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      setLoading(false);
      return false;
    }
  };

  const value = {
    user,
    loading,
    error,
    token,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}