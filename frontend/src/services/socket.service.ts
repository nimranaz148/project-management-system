import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = () => {
    if (!socket) {
        socket = io("http://localhost:8000", {
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
