import { useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    
    if (response.success) {
      const userData = {
        id: response.data.adminId,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role,
      };
      
      localStorage.setItem('adminToken', response.data.accessToken);
      localStorage.setItem('adminRefreshToken', response.data.refreshToken);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      
      setUser(userData);
    }
    
    return response;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
      setUser(null);
    }
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
