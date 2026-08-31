import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redisClient = null;

// Only connect to Redis if REDIS_URL is set OR if we're in production
// In development without Redis, features like queues will be disabled
const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
    try {
        redisClient = new Redis(REDIS_URL, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            lazyConnect: true,
        });

        redisClient.on("connect", () => {
            console.log("✅ Redis connected successfully");
        });

        redisClient.on("error", (err) => {
            console.warn("⚠️  Redis error:", err.message);
        });
    } catch (err) {
        console.warn("⚠️  Redis failed to initialize. Running without queues.");
        redisClient = null;
    }
} else {
    // Redis not configured in .env - run smoothly in direct mode
    redisClient = null;
}

export default redisClient;
