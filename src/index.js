import dotenv from "dotenv";
import app from "./app.js";
import connectMongoDb from "./db/connection.js";

dotenv.config({
    path: "./.env",
})



const PORT = process.env.PORT || 8000;


connectMongoDb(process.env.MONGODB_URL)

.then(app.listen(PORT, () => {
    console.log(`✅ Server is up and running on port ${PORT}`)}))
.catch(() =>{
    console.error("Failed to connect to MongoDB. Exiting...");
    process.exit(1);
});

//------------------------port listening------------------------
