import { Router } from "express";
import {
  getActiveAlerts,
  evaluateAlerts,
  markAsRead
} from "../controllers/alert.controllers.js";

const router = Router();

// GET active/unread alerts for dashboard
router.get("/active", getActiveAlerts);

// Internal evaluation hook triggered by Cron job or state engines
router.post("/internal/evaluate", evaluateAlerts);

// Mark an alert as read
router.patch("/:id/read", markAsRead);

export default router;