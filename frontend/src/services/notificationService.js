import api from '../config/api';

const notificationService = {
    /**
     * Get all notifications for the current user
     */
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications/');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            throw error;
        }
    },

    /**
     * Get count of unread notifications
     */
    getUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/unread_count/');
            return response.data.count;
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
            return 0;
        }
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (id) => {
        try {
            const response = await api.patch(`/notifications/${id}/mark_read/`);
            return response.data;
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async () => {
        try {
            const response = await api.post('/notifications/mark_all_read/');
            return response.data;
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            throw error;
        }
    },

    /**
     * Clear all read notifications
     */
    clearAll: async () => {
        try {
            const response = await api.delete('/notifications/clear_all/');
            return response.data;
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            throw error;
        }
    }
};

export default notificationService;
