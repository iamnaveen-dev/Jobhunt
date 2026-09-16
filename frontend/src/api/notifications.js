import axiosInstance from '../utils/axios';

export const notificationsAPI = {
    getNotifications: () => axiosInstance.get('/notifications/'),
    markRead: (id) => axiosInstance.patch(`/notifications/${id}/read/`),
    markAllRead: () => axiosInstance.post('/notifications/mark-all-read/'),
    deleteNotification: (id) => axiosInstance.delete(`/notifications/${id}/delete/`),
};