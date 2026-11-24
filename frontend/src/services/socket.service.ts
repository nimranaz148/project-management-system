import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const getSocketUrl = () => {
    if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '');
    }
    return "http://localhost:8000";
};

export const initSocket = () => {
    if (!socket) {
        socket = io(getSocketUrl(), {
            withCredentials: true,
            transports: ["websocket", "polling"]
        });

        socket.on("connect", () => {
            console.log("WebSocket Connected:", socket?.id);
        });

        socket.on("disconnect", () => {
            console.log("WebSocket Disconnected");
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
