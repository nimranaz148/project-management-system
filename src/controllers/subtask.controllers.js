import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {ApiResponse} from "../utils/api-response.js"
import { Task } from "../models/task.model.js";
import { subtaskTable } from "../models/subtask.model.js";





// -------------------Subtask controllers------------------
export const listSubTasks = asyncHandler(async (req, res) => {
        // get project id from url
        const {projectId, taskId} = req.params;

        // validate projectId and taskId
        if (!(projectId && taskId)) {
            throw new ApiError("Project ID and Task ID are Missing", 400);
        }

         const task = await Task.findOne({ _id: taskId, project: projectId })
         if (!task) {
            throw new ApiError("Task not found into Database because of wrong task ID or project ID", 404);
        }

        // projectid , taskid ==> subtaskd -> database 
        const subtasks = await subtaskTable.find({ task : taskId })

        if (subtasks.length < 1){
            return res.status(200).json(new ApiResponse(200, subtasks, "No Subtasks found in database for this task"))
        }

        return res.status(200).json(new ApiResponse(200, subtasks, "Subtasks fetched successfully"))

})


// --------------------create subtask
export const createSubTasks = asyncHandler(async (req, res) => {
    const {projectId, taskId} = req.params;

    if (!(projectId && taskId)) {
        throw new ApiError("Project ID and Task ID are Missing", 400);
    }

     // find task in database with project id and task id
    const task = await Task.findOne({ _id: taskId, project: projectId })
    if (!task) {
        throw new ApiError("Task not found into Database because of wrong task ID or project ID soo you can't create subtask", 404);
    }



    // create subtask in database
    const subtask = await subtaskTable.create({
        title: req.body.title,
        task: taskId,
        project: projectId,
        createdBy: req.user._id
    })

    return res.status(201).json(new ApiResponse(201, subtask, "Subtask created successfully"))

})


// --------------------update subtask
export const updateSubTasks = asyncHandler(async (req, res) => {
    const {projectId, taskId, subtaskId} = req.params;

    if (!(projectId && taskId && subtaskId)) {
        throw new ApiError("Project ID, Task ID and Subtask ID are Missing", 400);
    }

    const {title, isCompleted} = req.body;
    if (title && isCompleted === undefined) {
        throw new ApiError("At least one field is required to update subtask", 400);
    }

    // find task in database with project id and task id
    const task = await Task.findOne({ _id: taskId, project: projectId })
    if (!task) {
        throw new ApiError("Task not found into Database because of wrong task ID or project ID ", 404);
    }

    // find subtask in database with subtask id and task id
    const subtask = await subtaskTable.findOne({ _id: subtaskId, task: taskId })
    if (!subtask) {
        throw new ApiError("Subtask not found into Database because of wrong subtask ID or task ID ", 404);
    }

    // database manipulation
    if (title !== undefined) subtask.title = title;
    if (isCompleted == true) {
        subtask.isCompleted = isCompleted;
        subtask.comparedAt = new Date();
 }

   await subtask.save();
   
   return res.status(200).json(new ApiResponse(200, subtask, "Subtask updated successfully"))

})

// --------------------delete subtask

export const deleteSubTasks = asyncHandler(async (req, res) => {
    const {projectId, taskId, subtaskId} = req.params;

    if (!(projectId && taskId && subtaskId)) {
        throw new ApiError("Project ID, Task ID and Subtask ID are Missing", 400);
    }

    // find task in database with project id and task id
    const task = await Task.findOne({ _id: taskId, project: projectId })
    if (!task) {
        throw new ApiError("Task not found into Database because of wrong task ID or project ID ", 404);
    }

    // find subtask in database with subtask id and task id
    const subtask = await subtaskTable.findOne({ _id: subtaskId, task: taskId, project: projectId })
    if (!subtask) {
        throw new ApiError("Subtask not found into Database because of wrong subtask ID or task ID ", 404);
    }

    // delete subtask from database
    await subtaskTable.deleteOne({ _id: subtaskId, task: taskId })

    return res.status(200).json(new ApiResponse(200, null, "Subtask deleted successfully"))

})