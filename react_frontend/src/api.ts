import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access);
          api.defaults.headers.Authorization = `Bearer ${response.data.access}`;
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/token/`, { username, password });
    return response.data;
  },
  
  register: async (username: string, password: string, email?: string) => {
    const response = await axios.post(`${API_URL}/register/`, { username, password, email });
    return response.data;
  },
};

// Sightings API
export const sightingsAPI = {
  getAll: async () => {
    const response = await api.get('/sightings/');
    return response.data;
  },
  
  getMine: async () => {
    const response = await api.get('/sightings/', { params: { mine: 'true' } });
    return response.data;
  },
  
  getSportsList: async () => {
    const response = await api.get('/sports/');
    return response.data;
  },
  
  predict: async (image: File, lat: number, lng: number) => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('lat', lat.toString());
    formData.append('lng', lng.toString());
    
    const response = await api.post('/predict/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
