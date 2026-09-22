import {Router} from "express";


import { getLandRates } from "../controllers/landRateSchedule.controllers.js";

const router = Router();

router.get("/land-rates/:district_code", getLandRates);

export default router;