import api from "@/lib/api";

// ─── Auth API Calls ───────────────────────────────────────────────

export const loginUser = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
};

export const registerUser = async (username: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { username, email, password });
    return response.data;
};

export const logoutUser = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.post("/auth/current-user");
    return response.data;
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
    const response = await api.post("/auth/change-password", { oldPassword, newPassword });
    return response.data;
};

export const updateAvatar = async (formData: FormData) => {
    const response = await api.patch("/auth/update-avatar", formData);
    return response.data;
};
