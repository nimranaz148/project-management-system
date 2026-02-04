import mongoose, {Schema} from "mongoose";
import { join } from "path";

const projectMemberRoleSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: "User", required: true, index: true},

    project: {type: Schema.Types.ObjectId, ref: "Project", required: true, index: true},

    role: {type: String, enum: ["admin", "project_admin", "member"], default: "member"},

    joinedAt: {type: Date, default: Date.now},
    invitedBy: {type: Schema.Types.ObjectId, ref: "User", required: true},

    permissions: {
        canCreateTasks: {type: Boolean, default: true},
        canEditTasks: {type: Boolean, default: true},
        canDeleteTasks: {type: Boolean, default: false},
        canManageMembers: {type: Boolean, default: false},
        canViewReports: {type: Boolean, default: true},
    }

}, {timestamps: true });



export const ProjectMember = mongoose.model("ProjectMember", projectMemberRoleSchema)