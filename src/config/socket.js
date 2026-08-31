import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { userTable } from "../models/user.models.js";

let io;

function parseCookie(cookieString) {
    if (!cookieString) return {};
    return cookieString.split(';').reduce((res, c) => {
        const [key, val] = c.trim().split('=');
        if (key) res[key] = decodeURIComponent(val || '');
        return res;
    }, {});
}

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:3000",
            credentials: true,
        },
    });

    // Authentication Middleware for Sockets
    io.use(async (socket, next) => {
        try {
            const rawCookies = socket.handshake.headers?.cookie || "";
            const cookies = parseCookie(rawCookies);
            // Get token from cookie or handshake auth or headers
            const token = cookies.accessToken || socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
            
            if (!token) {
                console.warn("⚠️ WebSocket connection rejected: Access token missing");
                return next(new Error("Authentication error: Token missing"));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await userTable.findById(decoded._id).select("-password");

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            console.error("⚠️ WebSocket auth error:", error.message);
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

        // Join a specific room based on User ID for personal notifications
        socket.join(socket.user._id.toString());

        // Handle joining project rooms for real-time project updates
        socket.on("joinProject", (projectId) => {
            socket.join(`project_${projectId}`);
            console.log(`User ${socket.user.username} joined project room: project_${projectId}`);
        });

        socket.on("leaveProject", (projectId) => {
            socket.leave(`project_${projectId}`);
            console.log(`User ${socket.user.username} left project room: project_${projectId}`);
        });

        socket.on("disconnect", () => {
            console.log(`🔌 User disconnected: ${socket.user.username}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized!");
    }
    return io;
};
