import axios from "axios";

// Base API instance - points to our backend
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    withCredentials: true, // Important: sends cookies (JWT) with every request
});

// Response Interceptor: Handles token expiry globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If token expired, redirect to login
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                window.location.href = "/auth";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
