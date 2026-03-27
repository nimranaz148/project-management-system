import { compare } from "bcrypt";
import mongoose , {Schema} from "mongoose";

const subtaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, "Subtask title must be less than 100 characters"],

    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: [true, "Subtask must be associated with a Task"]
    },

    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Subtask must be associated with a Project"]
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Subtask must have a creator"]
    },

    isCompleted: {
        type: Boolean,
        default: false
    },

    comparedAt: {
        type: Date,
        default: null
    },

    completedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

}, {timestamps: true})



export const subtaskTable = mongoose.model("SubTask", subtaskSchema)