import axios from "axios";

export const api = axios.create({
    baseURL: `http://${window.location.hostname}:8000`,
    timeout: 20000,
    headers: {
        'Content-type': 'application/json'
    }
})

// • En tu computadora principal. Si entras a http://localhost:3000, window.location.hostname vale "localhost", 
// así que React consultará a http://localhost:8000.
// • En otro dispositivo de la red. Si entras desde el celular a http://192.168.1.45:3000, window.location.hostname 
// valdrá "192.168.1.45", por lo que React consultará automáticamente a http://192.168.1.45:8000.

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