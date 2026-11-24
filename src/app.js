import express from "express";
import cors from "cors";
import healthCheckRoutes from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/projects.routes.js";
import cookieParser from "cookie-parser";   
import ProjectMemberRouter from "./routes/projectMembers.routes.js";
import TaskRouter from "./routes/task.routes.js";
import subTaskRouter from "./routes/subtask.routes.js";
import noteRouter from "./routes/note.routes.js"
import aiRouter from "./routes/ai.routes.js"
import notificationRouter from "./routes/notification.routes.js"
import activityRouter from "./routes/activity.routes.js"

const app = express();

app.use(cookieParser());
//--------------------------middleware------------------------
app.use(express.json({limit: "16kb"})); // to make readable clients json body
app.use(express.urlencoded({extended: true, limit: "16kb"}));// this will encode your url for safety reason
app.use(express.static("public")); // this tells express about   never changing files like images,css,js files




//-----------------------CORS------------------------
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
    : ["http://localhost:3000"];

app.use(cors(
    {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],  
    }
))


//---------------------api---------------------------
app.get("/", (req, res) => {
    res.end("Welcome to Project Management API!");
});


//---------------------API routes---------------------------
app.use("/api/v1/healthcheck", healthCheckRoutes)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/project", projectRouter)
app.use("/api/v1/projects", ProjectMemberRouter)
app.use("/api/v1/tasks", TaskRouter) // 
app.use("/api/v1/tasks", subTaskRouter) 
app.use("/api/v1/notes", noteRouter) 
app.use("/api/v1/ai", aiRouter)
app.use("/api/v1/notifications", notificationRouter)
app.use("/api/v1/activity", activityRouter)

// Global error handler
app.use((err, req, res, next) => {
    console.error("🔥 GLOBAL ERROR HANDLER:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "production" ? undefined : (err.errors || err.message || err)
    });
});

export default app;