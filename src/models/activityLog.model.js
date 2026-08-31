import mongoose, { Schema } from "mongoose";

const activityLogSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    action: {
        type: String, // e.g., 'created', 'updated', 'deleted'
        required: true
    },
    entityType: {
        type: String, // e.g., 'task', 'project', 'member', 'note'
        required: true
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    changes: {
        type: Schema.Types.Mixed, // JSON diff of changes
        default: {}
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for efficient querying (as per PRD)
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
