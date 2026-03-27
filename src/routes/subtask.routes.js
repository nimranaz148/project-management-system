import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireProjectMember } from '../middlewares/project.middleware.js';
import { listSubTasks, createSubTasks, updateSubTasks, deleteSubTasks } from '../controllers/subtask.controllers.js';



const router = express.Router();

router.use(verifyJWT) // checking if you are logged in


// localhost:5000/api/v1/tasks/:projectId/t/:taskId/subtasks
router.route("/:projectId/t/:taskId/subtasks").all(requireProjectMember).get(listSubTasks)

router.route("/:projectId/t/:taskId/subtasks").all(requireProjectMember).post(createSubTasks)

router.route("/:projectId/t/:taskId/subtasks/:subtaskId").all(requireProjectMember).patch(updateSubTasks)

router.route("/:projectId/t/:taskId/subtasks/:subtaskId").all(requireProjectMember).delete(deleteSubTasks)






export default router;