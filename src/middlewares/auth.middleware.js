import { asyncHandler } from "../utils/async-handler.js";
import {userTable} from "../models/user.models.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js";




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