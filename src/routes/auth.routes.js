import express from 'express';
import { registerUser, login, verifyEmail, logoutUser , resendEmailVerification, getCurrentUser, refreshAccesToken, forgetPasswordRequest, resetForgetPassword, changeCurrentPassword, cbfunction, updateAvatar} from '../controllers/auth.controllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { uploadAvatar } from '../middlewares/upload.middleware.js';

const router = express.Router();

// localhost:8000/api/v1/auth/register
router.route("/register").post(registerUser) // user signup/ register route


// localhost:8000/api/v1/auth/verify-email/:verificationToken
router.route("/verify-email/:verificationToken").get(verifyEmail) // email verification route

router.route("/resend-email-verification").get(resendEmailVerification) // resend email verification route

router.route("/login").post(login) // user login route

router.route("/logout").post(verifyJWT,logoutUser) // user logout route

router.route("/current-user").post(verifyJWT, getCurrentUser) // get current logged in user route

router.route("/refresh-token").post(refreshAccesToken) // get current logged in user route


router.route("/forget-password").post(forgetPasswordRequest) // forget password route

router.route("/reset-password/:resetToken").post(resetForgetPassword) // reset password route 


router.route("/change-password").post(verifyJWT, changeCurrentPassword) // change password route


//-------------------Google Oauth Routes-----------------------------
import passport from "../config/passport.js";
import { passAuth } from '../middlewares/auth.middleware.js';
// ---------------------------LOGIN Google Oauth Routes-----------------------------
router.route("/google").get( passport.authenticate("google", { scope: ["profile", "email"] })) 
   
//----------------Googlr redirect back here after login---------
router.route("/google/callback").all(passAuth).get(cbfunction)

//-------------------failed login redirect----------------
router.route("/google/failure").get((req, res) => {
    return res.status(401).json({
        message: "Google Authentication Failed /google/failure"
    })
})

//-------------------------------------------------------------------------




// to update avatar
router.route("/update-avatar").all(verifyJWT, uploadAvatar.single("avatar")).patch(updateAvatar)

export default router;