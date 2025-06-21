import { apiConnector } from '../apiConnector';
import { adminEndpoints } from '../apis';

// Send notification to specific users or all users
export const sendNotification = async (data, token) => {
    try {
        const response = await apiConnector(
            "POST",
            `${adminEndpoints.SEND_NOTIFICATION_API}`,
            data,
            {
                Authorization: `Bearer ${token}`,
            }
        );
        
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("SEND_NOTIFICATION_API ERROR............", error);
        return { success: false, error: error.message };
    }
};

// Get all notifications (for admin view)
export const getAllNotifications = async (token) => {
    try {
        const response = await apiConnector(
            "GET",
            `${adminEndpoints.GET_ALL_NOTIFICATIONS_API}`,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );
        
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("GET_ALL_NOTIFICATIONS_API ERROR............", error);
        return { success: false, error: error.message };
    }
};

// Delete notification (admin only)
export const deleteNotificationAdmin = async (notificationId, token) => {
    try {
        const response = await apiConnector(
            "DELETE",
            `${adminEndpoints.DELETE_NOTIFICATION_API}/${notificationId}`,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );
        
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("DELETE_NOTIFICATION_API ERROR............", error);
        return { success: false, error: error.message };
    }
};
