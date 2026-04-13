import { asyncHandler } from "../utils/async-handler.js";
import {userTable} from "../models/user.models.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js";
import passport from "../config/passport.js";
import { error } from "node:console";




export const verifyJWT = asyncHandler(async (req, res, next) => {
    // getting client token from cookies
    const token = req.cookies?.accessToken
    
    // if token is not present, throw error
    if (!token) {
        throw new ApiError(401, "Access token is missing, please login")
    }

    try {
        // token decoded from jwt
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // find user associated with token
        const user = await userTable.findById(decodedToken._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry")

        // if user is not found, throw error
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        // attach user to request object
        req.user = user
        next() // procees to api function
    } catch (error) {
        throw new ApiError(401, "Invalid access token")
    }
})




//-------------------passAuth--------------------------
export const passAuth = (req, res, next) => {
    passport.authenticate("google", {session: false}, (err, user, info) => {
        console.log("err", err)
        console.log("user", user)
        console.log("info", info)




        if(err || !user){
            return res.status(401).json(
                {
                    message : "Google Authentication failed",
                    error: err?.message || info
                }
            )
        }

        req.user = user
        next()
    })(req, res, next)

}