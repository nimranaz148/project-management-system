import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { ProjectTable} from "../models/project.models.js";
import { ProjectMember } from "../models/projectMemberRole.model.js";




export const createProject = asyncHandler (async (req, res) => {
    const {name, description, settings} = req.body;

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
            visibility: settings?.visibility || "private",
            defaultTaskStatus: settings?.defaultTaskStatus || "to-do",
            allowGuestAccess: settings?.allowGuestAccess || false,
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

        // response to client
        res.status(201).json(new ApiResponse(201, "Project created successfully", project))
    });

    
    
    