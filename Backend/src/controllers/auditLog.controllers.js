import { AuditLog } from "../models/auditLog.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * 1. INTERNAL HOOK: LOG A CHANGE
 * Route: POST /api/v1/audit/internal/log-change
 * Note: This is called internally by other modules, not directly by the frontend.
 */
export const logChange = asyncHandler(async (req, res) => {
    const { user_id, entity_type, entity_id, action, old_value, new_value, ip_address } = req.body;

    if (!user_id || !entity_type || !entity_id || !action) {
        throw new ApiError(400, "Missing required audit fields: user_id, entity_type, entity_id, action");
    }

    const auditEntry = await AuditLog.create({
        user_id,
        entity_type,
        entity_id,
        action,
        old_value,
        new_value,
        ip_address: ip_address || req.ip || "0.0.0.0"
    });

    return res.status(201).json(
        new ApiResponse(true, { audit_log: auditEntry }, "Audit log recorded successfully")
    );
});

/**
 * 2 & 3. FETCH AUDIT LOGS (By Entity or By User)
 * Route: GET /api/v1/audit/audit-logs?entity_id=... OR ?user_id=...
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
    const { entity_id, user_id } = req.query;

    if (!entity_id && !user_id) {
        throw new ApiError(400, "Must provide either entity_id or user_id query parameter");
    }

    // Build the query dynamically based on what was asked for
    const query = {};
    if (entity_id) query.entity_id = entity_id;
    if (user_id) query.user_id = user_id;

    // Fetch logs, newest first
    const logs = await AuditLog.find(query).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(true, { count: logs.length, logs }, "Audit logs fetched successfully")
    );
});