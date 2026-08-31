import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controllers.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyJWT);

// API Routes
router.route("/").get(getMyNotifications);
router.route("/read-all").patch(markAllAsRead);
router.route("/:notificationId/read").patch(markAsRead);

export default router;
