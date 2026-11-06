import axios from "axios";

export const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
        'Content-type': 'application/json'
    }
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`; // Cambiado a 'Token' para Django
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;