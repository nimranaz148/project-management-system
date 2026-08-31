import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {ApiResponse} from "../utils/api-response.js"
import { Task } from "../models/task.model.js";
import { subtaskTable } from "../models/subtask.model.js";





// -------------------Subtask controllers------------------
export const listSubTasks = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    if (!(projectId && taskId)) {
        throw new ApiError(400, "Project ID and Task ID are missing");
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const subtasks = await subtaskTable.find({ task: taskId }).sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, subtasks, "Subtasks fetched successfully"));
});


// --------------------create subtask
export const createSubTasks = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    if (!(projectId && taskId)) {
        throw new ApiError(400, "Project ID and Task ID are missing");
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (!req.body.title?.trim()) {
        throw new ApiError(400, "Subtask title is required");
    }

    const subtask = await subtaskTable.create({
        title: req.body.title.trim(),
        task: taskId,
        project: projectId,
        createdBy: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, subtask, "Subtask created successfully"));
});


// --------------------update subtask
export const updateSubTasks = asyncHandler(async (req, res) => {
    const { projectId, taskId, subtaskId } = req.params;

    if (!(projectId && taskId && subtaskId)) {
        throw new ApiError(400, "Project ID, Task ID and Subtask ID are missing");
    }

    const { title, isCompleted } = req.body;
    if (title === undefined && isCompleted === undefined) {
        throw new ApiError(400, "At least one field is required to update subtask");
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const subtask = await subtaskTable.findOne({ _id: subtaskId, task: taskId });
    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    if (title !== undefined) subtask.title = title;
    if (isCompleted !== undefined) {
        subtask.isCompleted = isCompleted;
        subtask.comparedAt = isCompleted ? new Date() : null;
        subtask.completedBy = isCompleted ? req.user._id : null;
    }

    await subtask.save();

    return res.status(200).json(new ApiResponse(200, subtask, "Subtask updated successfully"));
});

// --------------------delete subtask
export const deleteSubTasks = asyncHandler(async (req, res) => {
    const { projectId, taskId, subtaskId } = req.params;

    if (!(projectId && taskId && subtaskId)) {
        throw new ApiError(400, "Project ID, Task ID and Subtask ID are missing");
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const subtask = await subtaskTable.findOne({ _id: subtaskId, task: taskId, project: projectId });
    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    await subtaskTable.deleteOne({ _id: subtaskId, task: taskId });

    return res.status(200).json(new ApiResponse(200, null, "Subtask deleted successfully"));
});