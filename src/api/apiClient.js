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

export default apiClient;