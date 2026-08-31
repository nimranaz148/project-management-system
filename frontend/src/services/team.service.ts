import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// We use axios with withCredentials to send the JWT cookie automatically
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export interface TeamMember {
    _id: string;
    project: string;
    user: {
        _id: string;
        username?: string;
        fullName?: string;
        email: string;
    };
    role: "admin" | "member";
    permissions: {
        canCreateTasks: boolean;
        canEditTasks: boolean;
        canDeleteTasks: boolean;
        canManageMembers: boolean;
        canViewReports: boolean;
    };
    createdAt: string;
}

export const listTeamMembers = async (projectId: string) => {
    return await api.get(`/projects/${projectId}/members`);
};

export const addTeamMember = async (projectId: string, email: string, role: string = "member") => {
    return await api.post(`/projects/${projectId}/members`, { email, role });
};

export const updateTeamMember = async (projectId: string, userId: string, role: string) => {
    return await api.put(`/projects/${projectId}/members/${userId}`, { role });
};

export const removeTeamMember = async (projectId: string, userId: string) => {
    return await api.delete(`/projects/${projectId}/members/${userId}`);
};
