import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)
            .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }

        req.user = user
        next()

    } catch (error) {
        throw new ApiError(401, "Invalid access token")

    }
})



export const validateProjectPermission = (roles = []) => {
    asyncHandler(async (req, res, next) => {
        const { projectId } = req.params

        if (!projectId) {
            throw new ApiError(400, "Project not found")
        }

        const project = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id),
        });

        if (!project) {
            throw new ApiError(400, "project not found");
        }

        const givenRole = projects?.role

        req.user.role = givenRole

        if (!roles.includes(givenRole)) {
            throw new ApiError(403, "You don't have permission to perform this action")
        }

        next()
    })
}

export const validateTaskPerminssion = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        const { taskId } = req.params

        if (!taskId) {
            throw new ApiError(400, "Task ID is required")
        }

        const task = await Task.findById(taskId)
        if (!task) {
            throw new ApiError(404, "Task not found")
        }

        const member = await ProjectMember.findOne({
            project: task.project,
            user: req.user._id
        })

        if (!member) {
            throw new ApiError(403, "You do not have permission to access this task")
        }

        if (roles.includes(member.role)) {
            throw new ApiError(403, "Your project role does not allow this action")
        }

        req.task = task
        next()
    })
}
