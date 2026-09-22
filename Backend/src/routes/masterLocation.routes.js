import {Router} from "express";

import {
  getStates,
  getDistricts,
  getVillages,
  convertArea,
  validateRecord
} from "../controllers/masterLocation.controllers.js";


const router = Router();

router.get("/states", getStates);
router.get("/districts/:state_code", getDistricts);
router.get("/villages/:district_code", getVillages);

router.post("/convert-area", convertArea);
router.post("/validate-record", validateRecord);

export default router;