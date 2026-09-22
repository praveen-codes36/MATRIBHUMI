import { Router } from "express";
import {
    uploadDocument,
    getDocumentsByProject,
    getDocumentVersions,
    downloadDocument
} from "../controllers/document.controllers.js";

const router = Router();

router.post("/", uploadDocument);
router.get("/", getDocumentsByProject); // Uses query param ?project_id=...
router.get("/:id/versions", getDocumentVersions);
router.get("/:id/download", downloadDocument);

export default router;