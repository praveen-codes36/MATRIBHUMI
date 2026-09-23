import { Alert } from "../models/alert.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/users.models.js";

/**
 * 1. GET ACTIVE ALERTS FOR LOGGED-IN OFFICER / DASHBOARD
 * Route: GET /api/v1/alerts/active
 */
export const getActiveAlerts = asyncHandler(async (req, res) => {
  const { project_id } = req.query;
  const user_id = req.user?._id;

  const filter = { is_read: false };
  if (project_id) filter.project_id = project_id;
  if (user_id) filter.$or = [{ user_id }, { user_id: null }];

  const alerts = await Alert.find(filter).sort({ created_at: -1 });

  return res
    .status(200)
    .json(new ApiResponse(true, { count: alerts.length, alerts }, "Active alerts fetched successfully"));
});

/**
 * 2. CRON / TRIGGER HOOK: EVALUATE SYSTEM ALERTS
 * Route: POST /api/v1/alerts/internal/evaluate
 */
export const evaluateAlerts = asyncHandler(async (req, res) => {
  const { project_id, type, message, severity, channel, user_id } = req.body;

  if (!project_id || !type || !message) {
    throw new ApiError(400, "Missing required alert evaluation fields: project_id, type, message");
  }

  const newAlert = await Alert.create({
    project_id,
    user_id: user_id || null,
    type,
    message,
    severity: severity || "HIGH",
    channel: channel || "IN_APP",
    is_read: false
  });

  return res
    .status(201)
    .json(new ApiResponse(true, { alert: newAlert }, "Alert rule evaluated and generated successfully"));
});

/**
 * 3. MARK ALERT AS READ
 * Route: PATCH /api/v1/alerts/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alert = await Alert.findByIdAndUpdate(
    id,
    { is_read: true },
    { new: true }
  );

  if (!alert) {
    throw new ApiError(404, "Alert not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(true, { alert }, "Alert marked as read"));
});