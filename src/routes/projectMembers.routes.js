import express from 'express';
import { listProjectMember, addProjectMember, updateProjectMember, deleteProjectMember } from '../controllers/projectMember.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireProjectMember, requireProjectAdmin } from '../middlewares/project.middleware.js';

const router = express.Router();

//-------------MIDDLEWARES------
router.use(verifyJWT) // you are login


//router.use(requireProjectMember) // you are also project member
// router.use ki jga all ka use krlia
// all(requireProjectMember) means you must be project member to access any of the routes in this router MIDDleware ko likhny k lye all ka use krte hain
//-------------------------------API ROUTES----------------------------------
router.route("/:projectId/members").all(requireProjectMember).get(listProjectMember)// SHOW ALL MEMBER


router.route("/:projectId/members").all(requireProjectMember).post(requireProjectAdmin,addProjectMember)//add a member


router.route("/:projectId/members/:userId").all(requireProjectMember).put(requireProjectAdmin, updateProjectMember) // update member role and permission


router.route("/:projectId/members/:userId").all(requireProjectMember).delete(requireProjectAdmin, deleteProjectMember) // remove member from project


export default router;