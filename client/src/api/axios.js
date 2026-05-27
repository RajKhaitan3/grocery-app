// ===========================================
// AXIOS API INSTANCE
// ===========================================
// WHY a separate file?
// Instead of writing "http://localhost:5000/api" in every component,
// we configure it once here. If the backend URL changes (like during
// deployment), we only change it in ONE place.
// ===========================================

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // import.meta.env.VITE_API_URL = environment variable for Vite
  // WHY VITE_ prefix? Vite only exposes env vars starting with VITE_
  withCredentials: true, // Send cookies with requests
});

// ===========================================
// REQUEST INTERCEPTOR
// ===========================================
// Runs BEFORE every request is sent.
// Automatically attaches the JWT token to every request.
// Without this, you'd have to manually add the token in every API call.
// ===========================================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===========================================
// RESPONSE INTERCEPTOR
// ===========================================
// Runs AFTER every response is received.
// If we get a 401 (unauthorized), the token is expired/invalid.
// We clear it and redirect to login.
// ===========================================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register page
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
