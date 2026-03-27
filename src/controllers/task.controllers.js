import {asyncHandler} from "../utils/async-handler.js"
import { ProjectTable } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ProjectMember } from "../models/projectMemberRole.model.js";
import {ApiResponse} from "../utils/api-response.js";
import { Task } from "../models/task.model.js";



export const createTask = asyncHandler (async (req, res) => {
    // verify project exist
    const {projectId} = req.params;
    const {
        title,
        description,
        assignedTo,
        dueDate,
        priority= "medium", // default priority when creating a task
        status = "todo", // default status when creating a task
        estimatedHours,
        tags,
        attachments,
        path
    } = req.body;

    // if title is not provided, return an error
    if(!title) {
        throw new ApiError(400, "Task title is required")
    }

    const project = await ProjectTable.findById(projectId)
    if(!project) {
        throw new ApiError(404, "Project not found")
    }

    const member = await ProjectMember.findOne({project: projectId, user: assignedTo})
    if(!member) {
        throw new ApiError(404, "Project member not found")
    }
    
    // validate due date
    if(dueDate && new Date(dueDate) < new Date()) {
        throw new ApiError(400, "Due date cannot be in the past")
    }

    //---------- validate status and priority
    const validateStatus = ["todo", "in-progress", "done"]
    const validatePriority = ["low", "medium", "high", "critical"]

    if (status && !validateStatus.includes(status)) {
        throw new ApiError(400, `Invalid status value. Valid options are: ${validateStatus.join(", ")}`)
    }

    if (priority && !validatePriority.includes(priority)) {
        throw new ApiError(400, `Invalid priority value. Valid options are: ${validatePriority.join(", ")}`)
    }

    const newTask = await Task.create({
        title:title,
        description: description,
        project: projectId,
        assignedTo: assignedTo || null,
        assignedBy: req.user._id,
        status: status,
        priority: priority,
        dueDate: dueDate || null,
        estimatedHours: estimatedHours || 0,
        tags: tags,
        attachments: attachments || [],
        path: path,
    })
    // if task  creation fail, return an error
    if(!newTask) {
        throw new ApiError(500, "Task creation failed")
    }

    // update project metadata
    await ProjectTable.findByIdAndUpdate(projectId, {
        $inc: { "metadata.totalTasks": 1 }, // increment total tasks by 1
        $set: { "metadata.lastActivity": new Date() } // update last activity
    }).exec()

    // send response to client
    return res.status(201).json(
        new ApiResponse(201, "Task created successfully", newTask))
})




//----------------------- list task------------------------
export const listTask = asyncHandler(async (req, res) => {
    // get project id from url
    const {projectId} = req.params;

    // verify project exist
    const project = await ProjectTable.findById(projectId)
    if(!project) {
        throw new ApiError(404, "Project not found")
    }

    // extract query parameters for filtering
    const { status, priority, assignedTo, tags, search, sort, page, limit, dueDate } = req.query;

    // build filter object based on provided filters
    const filter = { project: projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (tags) filter.tags = { $in: tags.split(",") }

    if (dueDateGte || dueDateLte) {
        filter.dueDate = {};
        if (dueDateGte) filter.dueDate.$gte = new Date(dueDateGte);
        if (dueDateLte) filter.dueDate.$lte = new Date(dueDateLte);
    }

    // pagination
    const pageNumber = Math.max(1, parseInt(page) || 1) // limit number should not exceed 100 to prevent performance issues
    const limitNumber = Math.min(100, parseInt(limit) || 10) // default limit is 10, maximum limit is 100
    const skip = (pageNumber - 1) * limitNumber // calculate how many items to skip based on current page and limit

    // sorting
    let validSort = ["createdAt", "dueDate", "priority", "status"] // default sorting by creation date in descending order
    const sortField = validSort.includes(sort) ? sort : "createdAt"
    const sortOrder = sort === "dueDate" ? 1 : -1 // sort by due date in ascending order, other fields in descending order

    // fetch task + total count in parallel
    const [tasks, totalCount] = await Promise.all([
        Task.find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limitNumber),
        Task.countDocuments(filter)
    ])

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, "Tasks retrieved successfully", {
            tasks,
            pagination: {
                total: totalCount,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalCount / limitNumber)
            }
        }))



})


//-- get task by details--------------------
export const getTaskDetails = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    // verify project exist
    const project = await ProjectTable.findById(projectId)
    if(!project) {
        throw new ApiError(404, "Project not found")
    }

    // fetch task details
    const task = await Task.findById(taskId).exec()
    if(!task) {
        throw new ApiError(404, "Task not found")
    }

    // check if task belongs to the project
    if(task.project.toString() !== projectId) {
        throw new ApiError(400, "Task does not belong to the specified project")
    }

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, "Task details fetched successfully", task))
})


//-- update task------------------only admin and  can update task
export const updateTask = asyncHandler(async (req, res) => {
        const { projectId, taskId } = req.params;
        const {
        title,
        description,
        assignedTo,
        dueDate,
        priority, // default priority when creating a task
        status, // default status when creating a task
        actualHours,
        tags,
        attachments
    } = req.body;

    // verify project exist
    const project = await ProjectTable.findById(projectId)
    if(!project) {
        throw new ApiError(404, "Project not found")
    }

    // fetch task details
    const task = await Task.findById(taskId).exec()
    if(!task) {
        throw new ApiError(404, "Task not found")
    }

    //---------- validate status and priority
    const validateStatus = ["todo", "in-progress", "done"]
    const validatePriority = ["low", "medium", "high", "critical"]

    if (status && !validateStatus.includes(status)) {
        throw new ApiError(400, `Invalid status value. Valid options are: ${validateStatus.join(", ")}`)
    }

    if (priority && !validatePriority.includes(priority)) {
        throw new ApiError(400, `Invalid priority value. Valid options are: ${validatePriority.join(", ")}`)
    }

    // validate due date
    if(dueDate && new Date(dueDate) < new Date()) {
        throw new ApiError(400, "Due date cannot be in the past")
    }

    // check if assignedTo user is a member of the project
    if (assignedTo) {
        const member = await ProjectMember.findOne({project: projectId, user: assignedTo})
        if (!member) {
            throw new ApiError(400, "Assigned user is not a member of the project")
        }
    }

    // update field (only update fields that are provided in the request body)
    if (title !== undefined) task.title = title;

    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (tags !== undefined) task.tags = tags;

    // if status is updated to "done", set completedAt
    if (status === "done" && task.status !== "done") {
        task.completedAt = new Date();
    }

    if (status !== "done" && task.status === "done") {
        task.completedAt = null; // reset completedAt if status is changed from done to something else
    }

    // save updated task
    await task.save()

    // update project metadata (e.g., last activity)
    await ProjectTable.findByIdAndUpdate(projectId, { lastActivity: new Date() }, { new: true }).exec()

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, "Task updated successfully", task))
})


//------------------- delete task------------------only admin can delete task
export const deleteTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params

    // verify project exist
    const project = await ProjectTable.findById(projectId)
    if(!project) {
        throw new ApiError(404, "Project not found")
    }

    // fetch task details
    const task = await Task.findById(taskId).exec()
    if(!task) {
        throw new ApiError(404, "Task not found")
    }

    // if user is not an admin, throw error
    if(req.membership.role !== "admin") {
        throw new ApiError(403, "Access denied. You are not an admin of this project")
        } 
        
    // delete task
    await Task.deleteOne({_id: taskId})

    // update project metadata
    await ProjectTable.findByIdAndUpdate(projectId, {
        $inc: { "metadata.totalTasks": -1 }, // decrement total tasks by 1
        $set: { "metadata.lastActivity": new Date() } // update last activity
    }).exec()

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, {},   "Task deleted successfully"))
})