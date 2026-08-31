import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireProjectAdmin, requireProjectMember } from '../middlewares/project.middleware.js';
import { createTask, listTask , getTaskDetails, updateTask, deleteTask} from '../controllers/task.controllers.js';
import { uploadTaskAttachments } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(verifyJWT) // checking if you are logged in

router.route("/:projectId")
    .post(requireProjectMember, requireProjectAdmin, uploadTaskAttachments.array("attachments", 10), createTask)
    .get(requireProjectMember, listTask);

router.route("/:projectId/:taskId")
    .get(requireProjectMember, getTaskDetails)
    .put(requireProjectMember, updateTask)
    .delete(requireProjectMember, requireProjectAdmin, deleteTask);

export default router;