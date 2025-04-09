import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // URL của backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm token vào header nếu có
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If you need to add specific methods for wishlist operations,
// you can add them here if you're extending the apiClient.
// If you're using Axios instance directly, no changes are needed.

export default apiClient;