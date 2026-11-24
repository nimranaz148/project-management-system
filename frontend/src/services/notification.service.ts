import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/notifications`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export interface NotificationData {
    _id: string;
    recipient: string;
    sender: string;
    type: "task_assigned" | "task_updated" | "project_invite" | "mention" | "system" | "warning";
    title: string;
    message: string;
    isRead: boolean;
    relatedEntity: string;
    entityModel: string;
    createdAt: string;
}

export const getMyNotifications = async () => {
    return await api.get("/");
};

export const markAsRead = async (notificationId: string) => {
    return await api.patch(`/${notificationId}/read`);
};

export const markAllAsRead = async () => {
    return await api.patch("/read-all");
};
