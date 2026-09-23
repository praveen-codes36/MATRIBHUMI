import { Router } from "express";
import {
  getReportTemplates,
  generateReport,
  createReportTemplate
} from "../controllers/report.controllers.js";

const router = Router();

// List saved report templates for reuse
router.get("/templates", getReportTemplates);

// Save a new template
router.post("/templates", createReportTemplate);

// Generate a report (PDF/Excel) from a saved or ad-hoc template
router.post("/generate", generateReport);

export default router;