import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — token qo'shish
api.interceptors.request.use((config) => {
    const token = Cookies.get('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — token expired bo'lsa refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            try {
                const refreshToken = Cookies.get('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                    { refreshToken },
                );

                Cookies.set('accessToken', data.accessToken, { expires: 1 / 96 }); // 15 min
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(original);
            } catch {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    },
);

export default api;