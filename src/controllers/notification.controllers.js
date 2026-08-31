import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Notification } from "../models/notification.model.js";

// ----------------------- Fetch User's Notifications -----------------------------
export const getMyNotifications = asyncHandler(async (req, res) => {
    // Fetch notifications sorted by newest first, limited to recent 50
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    
    // Count how many are unread for the badge on the frontend
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.status(200).json(new ApiResponse(200, "Notifications fetched successfully", { 
        notifications, 
        unreadCount 
    }));
});

// ----------------------- Mark Single Notification as Read -----------------------------
export const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: req.user._id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found or you don't have access to it");
    }

    res.status(200).json(new ApiResponse(200, "Notification marked as read", notification));
});

// ----------------------- Mark All Notifications as Read -----------------------------
export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false }, 
        { isRead: true }
    );
    
    res.status(200).json(new ApiResponse(200, "All notifications marked as read", null));
});
