import { apiConnector } from '../apiConnector';
import { notificationEndpoints } from '../apis';

const {
    GET_NOTIFICATIONS_API,
    MARK_AS_READ_API,
    MARK_ALL_READ_API,
    DELETE_NOTIFICATION_API,
} = notificationEndpoints;

export const getNotifications = async () => {
    try {
        const response = await apiConnector("GET", GET_NOTIFICATIONS_API);
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("GET_NOTIFICATIONS_API API ERROR............", error);
        return { success: false, error: error.message };
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await apiConnector("POST", MARK_AS_READ_API, {
            notificationId,
        });
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("MARK_AS_READ_API API ERROR............", error);
        return { success: false, error: error.message };
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await apiConnector("POST", MARK_ALL_READ_API);
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("MARK_ALL_READ_API API ERROR............", error);
        return { success: false, error: error.message };
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const response = await apiConnector("DELETE", DELETE_NOTIFICATION_API, {
            notificationId,
        });
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("DELETE_NOTIFICATION_API API ERROR............", error);
        return { success: false, error: error.message };
    }
};
