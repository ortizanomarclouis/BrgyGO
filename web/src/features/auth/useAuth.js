import { useState, useEffect, useContext, createContext } from 'react';
import api from '../../hooks/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/api/auth/login', { email, password, rememberMe });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const data = error.response?.data;
      if (data?.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          email: data.email,
          error: 'Please verify your email first.',
        };
      }
      return { success: false, error: data?.error || 'Login failed' };
    }
  };

  /**
   * Called by App.js after a successful Google OAuth redirect.
   * The token + user data have already been written to localStorage by App.js;
   * this just syncs the AuthContext state so the rest of the app re-renders.
   */
  const loginWithGoogleData = (userData) => {
    setUser(userData);
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return { success: true, email: response.data.email };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const updatedUser = { ...user, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true, user: updatedUser };
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogleData,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const useLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      return await login(email, password, rememberMe);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading };
};

export const useRegister = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      return await register(userData);
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading };
};