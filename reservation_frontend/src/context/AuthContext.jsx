import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (authService.isAuthenticated()) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        authService.logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    await authService.login(email, password);
    await fetchUser();
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = async (data) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    return updated;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isOwner: user?.role === 'OWNER',
    isWorker: user?.role === 'WORKER',
    isClient: user?.role === 'CLIENT',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};