import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split("") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);


// import routes
import healthCheckRouter from "./routes/healthcheck.route.js"
import authRouter from "./routes/auth.route.js"
import projectRouter from "./routes/project.routes.js";

app.use("/api/v1/healthcheck",healthCheckRouter)
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/projects",projectRouter)
export default app;
