import mongoose, {Schema} from "mongoose";


const taskSchema = new Schema({
    title: {type: String, required: true, maxlength: [200, "Title cannot exceed 200 characters"], trim: true},

    description: {type: String, maxlength: [2000, "Description cannot exceed 2000 characters"], trim: true},

    project: {type: Schema.Types.ObjectId, ref: "Project", required: true, index: true},

    assignedTo: {type: Schema.Types.ObjectId, ref: "User", default: null},

    assignedBy: {type: Schema.Types.ObjectId, ref: "User", required: true},

    status: {type: String, enum: ["todo", "in-progress", "done"], default: "todo", index: true},

    priority: {type: String, enum: ["low", "medium", "high", "critical"], default: "medium", index: true},

    dueDate: {type: Date, default: null, index: true},

    estimatedHours: {type: Number, min: [0, "Estimated hours cannot be negative"], default: null},

    actualHours: {type: Number, min: [0, "Actual hours must be positive"], default: null},

    tags: [{type: String, maxlength: [50, "Tag must be less than 50 characters"], trim: true}],

    attachments:[{
        filename: {type: String,
            trim: true,
            maxlength: [255, "Filename cannot exceed 255 characters"]
        },
        path: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, "File path cannot exceed 500 characters"]
        }
       
     }],
    
        


}, {timestamps: true})



export const Task = mongoose.model("Task", taskSchema)