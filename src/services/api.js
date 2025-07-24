/* eslint-disable no-undef */
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Access Vite environment variable
});

// Add an interceptor for authorization (JWT token) if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or use context if you have it
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);



export default api;
