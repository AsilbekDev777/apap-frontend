import api from '@/lib/api/api';
import { Notification } from '@/types';

interface NotificationsResponse {
    notifications: Notification[];
    unreadCount: number;
}

export const notificationsApi = {
    getAll: async (): Promise<NotificationsResponse> => {
        const { data } = await api.get<NotificationsResponse>('/notifications');
        return data;
    },

    markAllRead: async (): Promise<void> => {
        await api.put('/notifications/read-all');
    },

    markOneRead: async (id: string): Promise<void> => {
        await api.put(`/notifications/${id}/read`);
    },
};