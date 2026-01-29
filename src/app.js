import express from "express";
import cors from "cors";
import healthCheckRoutes from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
//--------------------------middleware------------------------
app.use(express.json({limit: "16kb"})); // to make readable clients json body
app.use(express.urlencoded({extended: true, limit: "16kb"}));// this will encode your url for safety reason
app.use(express.static("public")); // this tells express about   never changing files like images,css,js files




//-----------------------CORS------------------------

app.use(cors(
    {
        origin: process.env.CORS_ORIGINS || "*",
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


export default app;