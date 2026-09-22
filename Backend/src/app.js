import { createPersonBRouter } from "./person-b/router.js";
import { errorHandler } from "./person-b/errors.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

//middlewares

app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))


app.use(cookieParser())

//cors configurations
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"]
}),
);

//importing routes

import authRouter from "./routes/auth.route.js"

app.use("/api/v1/auth", authRouter)
app.use("/api/v1", createPersonBRouter({ authenticate: verifyJWT }))

app.get("/", (req, res) => {
    res.send("welcome TO MATRIBHUMI API")
})


app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }))
app.use(errorHandler)
export default app
