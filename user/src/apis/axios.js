import axios from 'axios';

// Vercel/Vite: define VITE_API_BASE_URL in Environment Variables
// Example: https://tinhluong-2.onrender.com
const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'https://tinhluong-2.onrender.com';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Request failed';
    return Promise.reject(new Error(message));
  },
);

export default client;
