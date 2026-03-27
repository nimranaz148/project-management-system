import { ProjectMember } from "../models/projectMemberRole.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

// you are a part of this project
export const requireProjectMember = asyncHandler (async (req, res, next) => {
    //get project ID from parameters
    const {projectId} = req.params;
    
    // 
    const membership = await ProjectMember.findOne({
        project: projectId,
         user: req.user._id
    })
    if(!membership) {
        return res.status(403).json(new ApiError(403, "Access denied. You are not a member of this project"))
    }

    // attach membership to request object for further use
    req.membership = membership

   
    next(); // Proceed to the next middleware or route handler
})



// you are an admin if you have admin role in the project, only admin can add new member to the project, remove member from the project and change member role in the project
export const requireProjectAdmin = (req, res, next) => {
    // is user also a member of the project
    if(!req.membership) {
        throw new ApiError(403, "Access denied. You are not a member of this project")
    }

    // if user is not an admin, throw error
    if(req.membership.role !== "admin") {
        throw new ApiError(403, "Access denied. You are not an admin of this project")
    }

    next(); // Proceed to the next middleware or route handler
}