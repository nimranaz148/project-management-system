import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { requireProjectMember } from "../middlewares/project.middleware.js"
import {suggestTasks, analyzeRisks, predictTimeline, balanceWorkload, smartassignTask, prioritizeTask, summarizeMeeting} from "../controllers/ai.controllers.js"

const router = express.Router()

router.use(verifyJWT)

router.route("/suggest-tasks/:projectId").all(requireProjectMember).post(suggestTasks)

router.route("/analyze-risks/:projectId").all(requireProjectMember).get(analyzeRisks)

router.route("/predict-timeline/:projectId").all(requireProjectMember).get(predictTimeline)

router.route("/balance-workload/:projectId").all(requireProjectMember).get(balanceWorkload)

// localhost:8000/api/ai/xxxx-xx/:taskId
router.route("/assign-task/:taskId").post(smartassignTask)
router.route("/prioritize/:taskId").post(prioritizeTask)

// general AI feature there are not project specific, just task specific
router.route("/summarize-meeting").post(summarizeMeeting)

export default router