import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/tasks`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export interface TaskData {
    _id?: string;
    project?: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: string;
    assignedTo?: {
        _id: string;
        username?: string;
        fullName?: string;
        email?: string;
        avatar?: string;
    } | string | any;
    createdAt?: string;
    updatedAt?: string;
}

// Get all tasks for a specific project
export const getProjectTasks = async (projectId: string) => {
    return await api.get(`/${projectId}`);
};

// Create a new task in a project
export const createTask = async (projectId: string, data: TaskData) => {
    return await api.post(`/${projectId}`, data);
};

// Update task (e.g. for drag and drop status change)
export const updateTask = async (projectId: string, taskId: string, data: Partial<TaskData>) => {
    return await api.put(`/${projectId}/${taskId}`, data);
};

// Delete a task
export const deleteTask = async (projectId: string, taskId: string) => {
    return await api.delete(`/${projectId}/${taskId}`);
};
