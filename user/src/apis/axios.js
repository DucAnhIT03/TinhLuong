import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const client = axios.create({
	baseURL: API_BASE_URL,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: false,
	timeout: 15000,
});

client.interceptors.response.use(
	(response) => response,
	(error) => {
		const message = error?.response?.data?.message || error?.message || 'Request failed';
		return Promise.reject(new Error(message));
	}
);

export default client;
