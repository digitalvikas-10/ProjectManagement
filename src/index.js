import dotenv from "dotenv"
import app from "./app.js";
import connectDB from "./db/db.js";

dotenv.config({
    path:"./.env",
})
  
const PORT = process.env.PORT || 3000;
connectDB()
 .then(()=>{
    app.listen(PORT,()=>{
        console.log(`✅ Server is running on port  http://localhost:${PORT}`)
    })
    })
 .catch((error)=>{
    console.error("❌ Failed to connect to MongoDB",error)
    process.exit(1)
 })
