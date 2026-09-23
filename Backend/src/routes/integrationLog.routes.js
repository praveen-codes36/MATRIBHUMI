import { Router } from "express";
import {
  getLandRecordsData,
  disbursePFMS,
  getGISOverlay
} from "../controllers/integrationLog.controllers.js";

const router = Router();

// Pull land ownership record from external state database
router.get("/land-records/:parcelId", getLandRecordsData);

// Push payment instruction to PFMS system
router.post("/pfms/disburse", disbursePFMS);

// Fetch cadastral map tile configurations for GIS overlay
router.get("/gis/overlay/:districtCode", getGISOverlay);

export default router;