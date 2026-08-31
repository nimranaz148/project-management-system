import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    recipient: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
        index: true 
    },
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        default: null // System generated notifications won't have a sender
    }, 
    type: { 
        type: String, 
        required: true, 
        enum: ["task_assigned", "task_updated", "project_invite", "mention", "system", "warning"] 
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false, 
        index: true 
    },
    relatedEntity: { 
        type: Schema.Types.ObjectId, 
        default: null // ID of the specific task or project
    },
    entityModel: { 
        type: String, 
        enum: ["Task", "Project", null], 
        default: null // Helps frontend know what to open when notification is clicked
    }
}, { 
    timestamps: true 
});

export const Notification = mongoose.model("Notification", notificationSchema);
