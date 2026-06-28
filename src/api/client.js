import axios from 'axios';

// Create a centralized Axios instance
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://fakestoreapi.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach auth token if needed in the future
client.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally (e.g., redirect to login)
    if (error.response?.status === 401) {
      console.error('Unauthorized access. Redirecting to login...');
      // window.location.href = '/login';
    }
    
    // Provide a standardized error message to the UI
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error(`API Error: ${errorMessage}`);
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Helper to get or create a persistent guest user ID stored in localStorage
export const getGuestUserId = () => {
  let userId = localStorage.getItem('guest_user_id');
  if (!userId) {
    // Generate a simple guest user ID
    userId = 'guest_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('guest_user_id', userId);
  }
  return userId;
};

