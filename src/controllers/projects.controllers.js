import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { ProjectTable} from "../models/project.models.js";
import { ProjectMember } from "../models/projectMemberRole.model.js";
import { logActivity } from "../utils/activity-logger.js";





export const createProject = asyncHandler (async (req, res) => {
    const {name, description, settings= {}} = req.body;

    // validation check
    if(!name || name.trim() === "") {
        throw new ApiError(400, "Project name is required and cannot be empty");
    }

    // create project In DB

    const project = await ProjectTable.create({
        name: name.trim(),
        description: description.trim(),
        createdBy: req.user._id,
        settings: {
            visibility: settings.visibility || "private",
            defaultTaskStatus: settings.defaultTaskStatus || "to-do",
            allowGuestAccess: settings.allowGuestAccess || false,
        },
        metadata: {
            totalMembers: 1,
            completedTasks: 0,
            totalTasks: 0,
            lastActivity: Date.now(),
        }
    });

        // creator becomes admin of the project

        await ProjectMember.create({
        user: req.user._id,
        project: project._id,
        role: "admin",
        invitedBy: req.user._id,
        permissions: {
            canCreateTasks: true,
            canEditTasks: true,
            canDeleteTasks: true,
            canManageMembers: true,
            canViewReports: true,
        },
        invitedBy: req.user._id

        })

        // Log activity
        logActivity(req.user._id, "created", "project", project._id, {}, req);

        // response to client
        res.status(201).json(new ApiResponse(201, "Project created successfully", project))
    });

// -----------------------list my all projects-----------------------------
export const listMyProjects = asyncHandler (async (req, res) => {
    // finding all project on behalf of user ID
    const membership = await ProjectMember.find({user: req.user._id}).populate("project").sort({createdAt: -1});
 
    // notified membership array to get only 2 properties project and role and permissions
    const projects = membership
    .filter((m) => (m.project && !m.project.isArchived))
    .map((m) => ({
        project: m.project,
        role: m.role,
        permissions: m.permissions,
    }));

    // response to client
    res.status(200).json(new ApiResponse(200, "Projects listed successfully", projects))
})

// -----------------------get project details-----------------------------
export const getProjectDetails = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await ProjectTable.findById(projectId);
    if (!project || project.isArchived) {
        throw new ApiError(404, "Project not found or is archived");
    }

    const membership = await ProjectMember.findOne({ project: projectId, user: req.user._id });
    if (!membership) {
        throw new ApiError(403, "Access denied. You are not a member of this project.");
    }

    res.status(200).json(new ApiResponse(200, "Project details fetched successfully", {
        project,
        role: membership.role,
        permissions: membership.permissions
    }));
});

// -----------------------update project-----------------------------
export const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, description, settings } = req.body;

    const project = await ProjectTable.findById(projectId);
    if (!project || project.isArchived) {
        throw new ApiError(404, "Project not found or is archived");
    }

    const membership = await ProjectMember.findOne({ project: projectId, user: req.user._id });
    if (!membership || membership.role !== "admin") {
        throw new ApiError(403, "Access denied. Only project admin can update project details.");
    }

    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (settings) {
        project.settings = {
            visibility: settings.visibility ?? project.settings.visibility,
            defaultTaskStatus: settings.defaultTaskStatus ?? project.settings.defaultTaskStatus,
            allowGuestAccess: settings.allowGuestAccess ?? project.settings.allowGuestAccess
        };
    }
    project.metadata.lastActivity = Date.now();

    await project.save();

    // Log activity
    logActivity(req.user._id, "updated", "project", project._id, req.body, req);

    res.status(200).json(new ApiResponse(200, "Project updated successfully", project));
});

// -----------------------delete (archive) project-----------------------------
export const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await ProjectTable.findById(projectId);
    if (!project || project.isArchived) {
        throw new ApiError(404, "Project not found or already archived");
    }

    const membership = await ProjectMember.findOne({ project: projectId, user: req.user._id });
    if (!membership || membership.role !== "admin") {
        throw new ApiError(403, "Access denied. Only project admin can delete a project.");
    }

    // Soft delete: set isArchived to true
    project.isArchived = true;
    project.archivedAt = Date.now();
    await project.save();

    // Log activity
    logActivity(req.user._id, "deleted", "project", project._id, {}, req);

    res.status(200).json(new ApiResponse(200, "Project archived successfully", null));
});