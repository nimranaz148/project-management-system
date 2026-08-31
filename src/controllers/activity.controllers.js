import { ActivityLog } from "../models/activityLog.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getProjectActivityLogs = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    // Get all task IDs associated with this project
    const projectTasks = await Task.find({ project: projectId }).select("_id");
    const taskIds = projectTasks.map(t => t._id);

    // Query logs where entityId is the project itself OR one of the project's tasks
    const logs = await ActivityLog.find({
        $or: [
            { entityId: projectId },
            { entityId: { $in: taskIds } },
            { entityType: "project" }
        ]
    })
        .populate("user", "username email profilePicture fullName")
        .sort({ createdAt: -1 })
        .limit(50);

    return res.status(200).json(
        new ApiResponse(200, logs, "Activity logs fetched successfully")
    );
});
