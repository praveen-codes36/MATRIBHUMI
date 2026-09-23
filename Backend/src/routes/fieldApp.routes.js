import { Router } from "express";
import {
  getTranslations,
  syncOfflineData
} from "../controllers/fieldApp.controllers.js";

const router = Router();

// GET UI translation bundle for the requested language
router.get("/i18n/:lang", getTranslations);

// POST batch-sync offline-captured survey data
router.post("/field/sync", syncOfflineData);

export default router;