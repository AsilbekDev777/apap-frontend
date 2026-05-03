import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) => {
                Cookies.set('accessToken', accessToken, { expires: 1 / 96 }); // 15 min
                Cookies.set('refreshToken', refreshToken, { expires: 7 });     // 7 kun
                set({ user, isAuthenticated: true });
            },

            logout: () => {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        },
    ),
);