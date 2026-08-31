import { ActivityLog } from "../models/activityLog.model.js";

/**
 * Helper function to log activities asynchronously
 * This allows us to track audit trails without blocking the main API response.
 */
export const logActivity = async (userId, action, entityType, entityId, changes = {}, req = null) => {
    try {
        const ipAddress = req ? req.ip || req.connection.remoteAddress : "system";
        const userAgent = req ? req.get("User-Agent") : "system";

        await ActivityLog.create({
            user: userId,
            action,
            entityType,
            entityId,
            changes,
            ipAddress,
            userAgent
        });
    } catch (error) {
        console.error("❌ Failed to log activity:", error);
    }
};
