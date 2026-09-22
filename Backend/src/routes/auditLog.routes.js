import { Router } from "express";
import { logChange, getAuditLogs } from "../controllers/auditLog.controllers.js";

const router = Router();

// Retrieve full change history for a specific record OR specific officer
router.get("/audit-logs", getAuditLogs);

// Internal hook called automatically by every write endpoint in the system
router.post("/internal/log-change", logChange);

export default router;