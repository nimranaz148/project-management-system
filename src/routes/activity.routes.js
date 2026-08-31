import express from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireProjectMember } from '../middlewares/project.middleware.js';
import { getProjectActivityLogs } from '../controllers/activity.controllers.js';

const router = express.Router();

router.use(verifyJWT); // Must be logged in

// localhost:8000/api/v1/activity/:projectId
router.route("/:projectId").all(requireProjectMember).get(getProjectActivityLogs);

export default router;
