import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { ProjectMember } from "../models/projectMemberRole.model.js";
import { ProjectTable } from "../models/project.models.js";
import { userTable } from "../models/user.models.js";



export const listProjectMember = asyncHandler (async (req, res) => {
    //get project ID from params
    const {projectId} = req.params;

    // throw error if project ID is not provided or invalid
    if(!projectId) {
        return res.status(400).json(new ApiError(400, "Project ID is required"))
    }

    // find project members in DB using project ID and populate user details
    const members = await ProjectMember.find({project: projectId}).populate("user", "name email")
    .sort({createdAt: -1})
    




    res.status(200).json(new ApiResponse(200, "Project members listed successfully", members))
})


//-----------------------ADD new member to the project-----------------------------

export const addProjectMember = asyncHandler (async (req, res) => {
    // GET the project ID from request params
    const {projectId} = req.params;

    // throw error if project ID is not provided or invalid
    if(!projectId) {
        return res.status(400).json(new ApiError(400, "Project ID is required"))
    }

    // get email , role and permission from req.body
    const {email, role = "member", permissions} = req.body;


    // verify project exist 
    const project = await ProjectTable.findById(projectId);
    if(!project) {
        return res.status(404).json(new ApiError(404, "Project not found"))
    }

    // find user in database using email
    const user = await userTable.findOne({email: email.toLowerCase().trim()})
    if(!user) {
        return res.status(404).json(new ApiError(404, "User not found, please ask user to register first"))
    }

    // check if user is already a member of the project
    const existingMember = await ProjectMember.findOne({project: projectId, user: user._id})
    if(existingMember) {
        return res.status(400).json(new ApiError(400, "User is already a member of the project.you cannot add same user twice"))
    }

    // create new project member
    const newMember = await ProjectMember.create({
        project: projectId,
        user: user._id,
        role: role,
        permissions: {
            canCreateTasks: permissions?.canCreateTasks  ?? true,
            canEditTasks: permissions?.canEditTasks ?? true,
            canDeleteTasks: permissions?.canDeleteTasks ?? false,
            canManageMembers: permissions?.canManageMembers ?? false,
            canViewReports: permissions?.canViewReports ?? true,
        }
    })

    // update project metadata totalmember ++
    await ProjectTable.findByIdAndUpdate(projectId, {
        $inc: { "metadata.totalMembers": 1 }, // increment total members by 1
        $set: { "metadata.lastActivity": new Date() } // update last activity
    })
    
    // populate user details in the new member object
    const populatedNewMember = await ProjectMember.findById(newMember._id).populate("user", "name email")
    // send response to client
    res.status(201).json(new ApiResponse(201, "Project member added successfully", populatedNewMember))


})


//-----------------------update member role and permission-----------------------------

export const updateProjectMember = asyncHandler (async (req, res) => {
     // GET the project ID and user ID from request params
    const {projectId, userId} = req.params;

    // throw error if project ID is not provided or invalid
    if(!projectId) {
        return res.status(400).json(new ApiError(400, "Project ID is required"))
    }
    // GET role and permissions from req.body
     const {role, permissions} = req.body;

     // verify project exist 
     const project = await ProjectTable.findById(projectId);
    if(!project) {
        return res.status(404).json(new ApiError(404, "Project not found"))
    }

    // find project member in database using project ID and user ID
    const  projectMember = await ProjectMember.findOne({project: projectId, user: userId})
    if(!projectMember) {
        return res.status(404).json(new ApiError(404, "Project member not found"))
    }

    // only allow admin to update member role and permissions
    if(req.membership.role !== "admin") {
        return res.status(403).json(new ApiError(403, "You are not an admin of this project. Only project admin can update member role and permissions"))
    }

    // prevent removing last admin from the project(basic safety)
   if(projectMember.role === "admin" && project.metadata.totalMembers === 1){
        return res.status(400).json(new ApiError(400, "This project  must atleast have one admin. You cannot remove last admin from the project"))

    } 

    // update member role and permissions
    projectMember.role = role?? projectMember.role;
    projectMember.permissions = {
        canCreateTasks: permissions?.canCreateTasks  ?? projectMember.permissions.canCreateTasks,
        canEditTasks: permissions?.canEditTasks ?? projectMember.permissions.canEditTasks,
        canDeleteTasks: permissions?.canDeleteTasks ?? projectMember.permissions.canDeleteTasks,
        canManageMembers: permissions?.canManageMembers ?? projectMember.permissions.canManageMembers,
        canViewReports: permissions?.canViewReports ?? projectMember.permissions.canViewReports,
    }
    await projectMember.save()

    // populate user details in the updated member object
    await projectMember.populate("user", "name email")

    // send response to client
    res.status(200).json(new ApiResponse(200, "Project member updated successfully", projectMember))
    
})


//-----------------------delete member from the project-----------------------------

export const deleteProjectMember = asyncHandler (async (req, res) => {
    // GET the project ID and user ID from request params
    const {projectId, userId} = req.params;

    // throw error if project ID is not provided or invalid
    if(!projectId) {
        return res.status(400).json(new ApiError(400, "Project ID is required"))
    }

     // verify project exist 
     const project = await ProjectTable.findById(projectId);
    if(!project) {
        return res.status(404).json(new ApiError(404, "Project not found"))
    }

    // find project member in database using project ID and user ID
    const  projectMember = await ProjectMember.findOne({project: projectId, user: userId})
    if(!projectMember) {
        return res.status(404).json(new ApiError(404, "Project member not found"))
    }

     // prevent removing last admin from the project(basic safety)
    if(projectMember.role === "admin" && project.metadata.totalMembers === 1){
        return res.status(400).json(new ApiError(400, "This project  must atleast have one admin. You cannot remove last admin from the project"))

    } 

    // delete member from project
    await projectMember.deleteOne()

    // update project metadata totalmember --
    await ProjectTable.findByIdAndUpdate(projectId, {
        $inc: { "metadata.totalMembers": -1 }, // decrement total members by 1
        $set: { "metadata.lastActivity": new Date() } // update last activity
    })

    // send response to client
    res.status(200).json(new ApiResponse(200, "Project member deleted successfully", projectMember))
    
})