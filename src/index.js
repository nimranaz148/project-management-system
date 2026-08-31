import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectMongoDb from "./db/connection.js";
import { initializeSocket } from "./config/socket.js";
import "./config/redis.js"; // Initialize Redis connection
import logger from "./utils/logger.js";
import "./services/queue.service.js"; // Initialize Background Queues

dotenv.config({
    path: "./.env",
})

const PORT = process.env.PORT || 8000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

connectMongoDb(process.env.MONGODB_URL)
.then(() => {
    server.listen(PORT, () => {
        logger.info(`✅ Server is up and running on port ${PORT}`);
    });
})
.catch((err) =>{
    logger.error("Failed to connect to MongoDB. Exiting...", err);
    process.exit(1);
});
