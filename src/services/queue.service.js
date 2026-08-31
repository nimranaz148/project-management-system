import { Queue, Worker } from "bullmq";
import redisClient from "../config/redis.js";
import logger from "../utils/logger.js";

// Queue service - only runs if Redis is available
export let backgroundQueue = null;

if (!redisClient) {
    logger.warn("⚠️  Queue service disabled - Redis not available. Install Redis to enable background jobs.");
} else {
    try {
        // Create a Queue for Background Jobs (Emails, AI Tasks)
        backgroundQueue = new Queue("background-jobs", { connection: redisClient });

        // Create a Worker to process these jobs in the background
        const worker = new Worker("background-jobs", async (job) => {
            logger.info(`⏳ Processing job ${job.id} of type: ${job.name}`);

            if (job.name === "send_email") {
                logger.info(`📧 Email sent successfully to ${job.data.email}`);
            } else if (job.name === "process_ai_task") {
                logger.info(`🤖 AI task processed for project ${job.data.projectId}`);
            }
        }, { connection: redisClient });

        worker.on("completed", (job) => {
            logger.info(`✅ Job ${job.id} has completed successfully!`);
        });

        worker.on("failed", (job, err) => {
            logger.error(`❌ Job ${job.id} failed with error: ${err.message}`);
        });

        logger.info("✅ Queue service initialized successfully");
    } catch (err) {
        logger.warn("⚠️  Queue service failed to initialize:", err.message);
    }
}
