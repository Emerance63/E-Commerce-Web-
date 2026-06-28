import axios from 'axios';
import { getStoredToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || 'https://e-commas-apis-production-e0f8.up.railway.app/api';

export const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access.');
    }

    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error(`API Error: ${errorMessage}`);

    return Promise.reject(new Error(errorMessage));
  }
);
