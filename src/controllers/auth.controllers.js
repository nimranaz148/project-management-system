import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import { userTable } from "../models/user.models.js"
import { sendEmail, emailverificationmailgencontent } from "../utils/mail.js"
import crypto from "crypto"
import jwt from "jsonwebtoken"





const registerUser = asyncHandler( async (req, res) => {
    // getting data from client
    const { username, email, password } = req.body

    // check if user already exists
    const existingUser = await userTable.findOne({
        $or: [{email}, {username}]
    })

    // if user exists, throw error
    if (existingUser) {
        throw new ApiError(400, "User with given email or username already exists")
    }

    // create new user
    const newUser = await  userTable.create({
        username,
        email,
        password,
        isEmailVerified: false,
    })

    // create temporarytoken for email  for 20 minutes
    const { unHashedToken,hashedToken,TokenExpiry} = newUser.generateTemporaryToken()

    newUser.emailVerificationToken = hashedToken //save hashed token in db
    newUser.emailVerificationTokenExpiry = TokenExpiry
    await newUser.save({ validateBeforeSave: false })

    //send email

    await sendEmail({
        email: newUser.email,
        subject: "Please verify your Email ",
        mailgenContent: emailverificationmailgencontent(
            newUser.username, 
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
        )
    })

    // excluding fields from database
    const createdUser = await userTable.findById(newUser._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry ")

    if(!createdUser){
        throw new ApiError(400, "User registration failed")
    }

    // send response
    return res.status(201).json(
        new ApiResponse(201, {user:createdUser}, "User created successfully")
    )

})


//----------------------------------------LOG IN
const login = asyncHandler( async (req, res) => {
    // getting data from client
    const { email, password, username } = req.body

    // check if user exists
    if(!email){
        throw new ApiError(400, "Email is required")
    }

    // check if user exists in database
    const existingUser = await userTable.findOne({email})

    // if user does not exist, throw error
    if (!existingUser) {
        throw new ApiError(404, "User not found, please register")
    }

    // check if password is correct
    const isPasswordCorrect = await existingUser.isPasswordCorrect(password)

    // if password is incorrect, throw error
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect password")
    }

    // generate access token & refresh token
    const accessToken = existingUser.generateAccessToken()
    const refreshToken = existingUser.generateRefreshToken()

    // save refresh token in database
    existingUser.refreshToken = refreshToken
    await existingUser.save({ validateBeforeSave: false })

    // setting httpOnly cookies
    const options = {
        httpOnly: true,
        secure:true,
    }

    // returning response to client with user details and tokens
    return res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(200,{
            user: {
                _id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
            },
            accessToken,
            refreshToken,
        }, 
        "User logged in successfully"
        ))

})
 

//-------------------------------VERIFY EMAIL----------------------

const verifyEmail = asyncHandler( async (req, res) => {
    // getting verification token from params
    const { verificationToken } = req.params

    // if token is not present, throw error
    if (!verificationToken) {
        throw new ApiError(400, "Verification token is missing")
    }

    // hash the token received from params to compare with database
    const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")
    
    // find user with the hashed token and check if token is not expired
    const user = await userTable.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now() } // token expiry should be greater than current time
    })

    // if user is not found, throw error
    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token")
    }

    // update user email verification status
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiry = undefined

    // save the updated user
    await user.save({ validateBeforeSave: false })

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, null, "Email verified successfully")
    )

});


//-------------------------------LOGOUT USER----------------------

const logoutUser = asyncHandler( async (req, res) => {
    // clear refresh token from database
    await userTable.findByIdAndUpdate(req.user._id,
    {
        $set: {refreshToken: ""}
    },
    {
        new:true
    })

    // option to clear cookies
    const options = {
        httpOnly: true,
        secure:true,
    }

    // send response to client
    return res
    .status(200)
    .cookie("refreshToken", "", options)
    .cookie("accessToken", "", options)
    .json(
        new ApiResponse(200, null, "User logged out successfully")
    )

});

//-------------------------------RESEND EMAIL VERIFICATION----------------------
const resendEmailVerification = asyncHandler(async (req, res) => {
    // getting user from req.body
    const { email } = req.body

    // find user in database with the help of email
    const user = await userTable.findOne({ email })

    // if user is not found, throw error
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // if email is already verified, throw error
    if (user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified")
    }

     // create temporarytoken for email  for 20 minutes
    const { unHashedToken,hashedToken,TokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken //save hashed token in db
    user.emailVerificationTokenExpiry = TokenExpiry
    await user.save({ validateBeforeSave: false })
    //send email

    await sendEmail({
        email: user.email,
        subject: "Please verify your Email ",
        mailgenContent: emailverificationmailgencontent(
            user.username, 
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
        )
    })

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, null, "Verification email resent successfully")
    )
})


const getCurrentUser = asyncHandler( async (req, res) => {
    // send response to client with current logged in user details from req.user set in verifyJWT middleware
    return res.status(200).json(
        new ApiResponse(200, {user: req.user}, "Current user fetched successfully")
    )
})


//-------------------------------REFRESH ACCESS TOKEN----------------------
const refreshAccesToken = asyncHandler( async (req, res) => {
    //get refresh tokken from ccokies
    const incomingRefreshToken = req.cookies.refreshToken|| req.body.refreshToken

    // if refresh token is not present, throw error
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing, please login again")
    }

    try {
        // verify incoming refresh token from client to get _id
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // find user in database with the help of _id from decoded token
        const user = await userTable.findById(decodedToken._id)

        // if user is not found, throw error
        if (!user) {
            throw new ApiError(404, "User not found, please register")
        }

        // check if refresh token of client matches one in database
        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token, please login again")
        }

        // generate new access token
        const newAccessToken = user.generateAccessToken()

        // option to clear cookies
       const options = { 
        httpOnly: true,
            secure:true,
    }

        // send response to client with new access token
        return res.status(200)
        .cookie("accessToken", newAccessToken, options)
        .json(
            new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed successfully")
        )
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token, please login again")
        
    }

})

//------------------------FORGET PASSWORD REQUEST----------------------

const forgetPasswordRequest = asyncHandler( async (req, res) => {
    // getting email from client
    const { email } = req.body

    // find user in database with the help of email
    const user = await userTable.findOne({ email })


    // if user is not found, throw error
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // create temporarytoken for password reset  for 20 minutes
     
    const { unHashedToken,hashedToken,TokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken //save hashed token in db
    user.emailVerificationTokenExpiry = TokenExpiry
    await user.save({ validateBeforeSave: false })

    //send email

    await sendEmail({
        email: user.email,
        subject: "Please verify your Email ",
        mailgenContent: emailverificationmailgencontent(
            user.username, 
            `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unHashedToken}`
        )
    })
    // send response to client
    return res.status(200).json(
        new ApiResponse(200, null, "Password reset email sent successfully, please check your inbox")
    )
    
})


//----------------------------RESET FORGOT PASSWORD----------------------
const resetForgetPassword = asyncHandler( async (req, res) => {
    // getting reset token from params
    const { resetToken } = req.params //reset token = unHashedToken 
    const  newPassword  = "password123"        //req.body
    
    // if token is not present, throw error
    if (!resetToken) {
        throw new ApiError(400, "Reset token is missing")
    }

    // hash the token received from params to compare with database
    const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    // find user with the hashed token and check if token is not expired
    const user = await userTable.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now() } // token expiry should be greater than current time
    })

    // if user is not found, throw error
    if (!user) {
        throw new ApiError(400, "Invalid or expired reset token")
    }

    // update user password
    user.password = newPassword
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiry = undefined
    await user.save({ validateBeforeSave: false })

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successfully")
    )

})

//----------------------------CHANGE PASSWORD----------------------
const changeCurrentPassword = asyncHandler( async (req, res) => {
    // getting old and new password from req.body
    const { oldPassword, newPassword } = req.body

    // find user in database 
    const user = await userTable.findById(req.user._id)

    // if user is not found, throw error
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // check if old password is correct
    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    // update users password
    user.password = newPassword // set new password
    await user.save({ validateBeforeSave: false })

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    )
})



export { registerUser, login, verifyEmail, logoutUser, resendEmailVerification, getCurrentUser, refreshAccesToken, forgetPasswordRequest, resetForgetPassword, changeCurrentPassword }

//------------------------------------




