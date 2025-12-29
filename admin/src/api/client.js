import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('adminRefreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/admin/auth/refresh`, {
            refreshToken,
          });

          localStorage.setItem('adminToken', data.data.accessToken);
          localStorage.setItem('adminRefreshToken', data.data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return client(originalRequest);
        } catch {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminRefreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default client;
