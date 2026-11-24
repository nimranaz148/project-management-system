import app from "../src/app.js";
import connectMongoDb from "../src/db/connection.js";

let isConnected = false;

export default async function handler(req, res) {
    if (!isConnected && process.env.MONGODB_URL) {
        try {
            await connectMongoDb(process.env.MONGODB_URL);
            isConnected = true;
        } catch (error) {
            console.error("DB connection error in serverless handler:", error);
        }
    }
    return app(req, res);
}
