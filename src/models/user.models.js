
import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";



const userSchema = new Schema({
    avatar: {
        type: {
            url: String,
        },
        default: {
            url: "https://placehold.co/400x400",
        }
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true, 
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationTokenExpiry: {
        type: Date,
    },
}, {
    timestamps: true,
});


//-----------------------------Pre Hooks----------------


userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        //if password is not modified then return next()
        return ;
    }
    
    this.password = await bcrypt.hash(this.password, 10);
})

//-------------------------Compare PASSWORD Methods----------------
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//-------------------Generate JWT Access Token Method----------------
userSchema.methods.generateAccessToken = function () {
    const payload = {
        _id: this._id,
        email: this.email,
        username: this.username,
    }
    return jwt.sign(
        payload, 
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

//-------------------Generate JWT Refresh Token Method----------------
userSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id: this._id,
        
    }
    return jwt.sign(
        payload, 
        process.env.REFRESH_TOKEN_SECRET, 
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

//-------------Temporary token for email verification & password reset----------------
userSchema.methods.generateTemporaryToken = function () {
   const unHashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

    
    const TokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes from now

    return {
        unHashedToken,
        hashedToken,
        TokenExpiry,
    };
}


const userTable = mongoose.model("User", userSchema);
export {userTable}