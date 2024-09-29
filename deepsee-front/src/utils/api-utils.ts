import axios from 'axios';

import router from '../router';

const api = axios.create({
    // dev : baseURL: 'http://localhost:3000/api/',
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

const getToken = () => localStorage.getItem('token');

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                router.push('/signin');
            } else if (error.response.status === 404) {
                router.push('/404');
            } else {
                console.error(`Error: ${error.response.status} - ${error.response.data.error}`);
            }
        } else {
            console.error(`Error: ${error.message}`);
        }
        return Promise.reject(error);
    },
);

export default api;
