// ===========================================
// AUTH CONTEXT
// ===========================================
// WHAT IS CONTEXT?
// Context is React's way of sharing data across many components
// WITHOUT passing props through every level (called "prop drilling").
//
// Example WITHOUT Context:
//   App → Navbar → UserMenu → UserName (pass user data through ALL of them)
//
// Example WITH Context:
//   App wraps everything in AuthProvider
//   UserName just reads useAuth() directly — no prop drilling!
//
// Think of Context like a "global announcement system" in your app.
// ===========================================

import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

// Step 1: Create the context (the "announcement channel")
const AuthContext = createContext(null);

// Step 2: Create a custom hook for easy access
// Instead of writing useContext(AuthContext) everywhere,
// we just write useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Step 3: Create the Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On app load, check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          setUser(data.user);
        } catch (error) {
          // Token is invalid/expired — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // ---- Login ----
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  // ---- Register ----
  const register = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  // ---- Logout ----
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // ---- Update Profile ----
  const updateProfile = async (profileData) => {
    const { data } = await API.put('/auth/profile', profileData);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  // The "value" is what all children components can access
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
