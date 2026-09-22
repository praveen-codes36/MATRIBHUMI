import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

//middlewares

app.use(express.json())
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
import masterLocationRouter from "./routes/masterLocation.routes.js"
import landRateRouter from "./routes/landRateSchedule.routes.js"

//mounting routes
app.use("/api/v1/master-location", masterLocationRouter)
app.use("/api/v1/land-rate", landRateRouter)
app.use("/api/v1/auth" , authRouter)

app.get("/", (req, res) => {
    res.send("welcome TO MATRIBHUMI API")
})


export default app
