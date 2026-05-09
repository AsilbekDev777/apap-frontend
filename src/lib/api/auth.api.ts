import api from '@/lib/api/api';
import { User } from '@/types';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/auth/login', {
            email,
            password,
        });
        return data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },
};