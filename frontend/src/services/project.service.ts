import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/project`;

// Setup axios instance with credentials (cookies)
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export interface ProjectData {
    name: string;
    description?: string;
    settings?: {
        visibility: 'private' | 'team' | 'public';
        defaultTaskStatus: string;
    };
}

export const createProject = async (data: ProjectData) => {
    return await api.post('/', data);
};

export const listProjects = async () => {
    return await api.get('/');
};

export const getProjectDetails = async (projectId: string) => {
    return await api.get(`/${projectId}`);
};

export const updateProject = async (projectId: string, data: Partial<ProjectData>) => {
    return await api.put(`/${projectId}`, data);
};

export const deleteProject = async (projectId: string) => {
    return await api.delete(`/${projectId}`);
};
