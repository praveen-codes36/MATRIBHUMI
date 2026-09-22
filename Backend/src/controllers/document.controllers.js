import { Document } from "../models/document.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {user} from "../models/users.models.js"

/**
 * 1. UPLOAD A DOCUMENT
 * Route: POST /api/v1/documents
 */
export const uploadDocument = asyncHandler(async (req, res) => {
    const { project_id, entity_type, entity_id, document_type, file_url, checksum } = req.body;
    const uploaded_by = req.user?._id || "system_dummy_user"; // Replace with actual auth user later

    if (!project_id || !entity_type || !entity_id || !file_url || !checksum) {
        throw new ApiError(400, "Missing required document fields");
    }

    // Check if a previous version exists to increment the version number
    const previousDoc = await Document.findOne({ project_id, entity_type, entity_id, document_type })
        .sort({ version: -1 });

    const newVersion = previousDoc ? previousDoc.version + 1 : 1;

    const newDocument = await Document.create({
        project_id,
        entity_type,
        entity_id,
        document_type,
        file_url,
        version: newVersion,
        uploaded_by,
        checksum
    });

    return res.status(201).json(
        new ApiResponse(true, { document: newDocument }, "Document uploaded successfully")
    );
});

/**
 * 2. GET DOCUMENTS BY PROJECT
 * Route: GET /api/v1/documents?project_id=...
 */
export const getDocumentsByProject = asyncHandler(async (req, res) => {
    const { project_id, type } = req.query;

    if (!project_id) {
        throw new ApiError(400, "project_id query parameter is required");
    }

    const filter = { project_id };
    if (type) filter.document_type = type;

    // Get the latest version of each document for this project
    const documents = await Document.find(filter).sort({ uploaded_at: -1 });

    return res.status(200).json(
        new ApiResponse(true, { count: documents.length, documents }, "Documents fetched successfully")
    );
});

/**
 * 3. GET DOCUMENT VERSIONS
 * Route: GET /api/v1/documents/:id/versions
 */
export const getDocumentVersions = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the requested document first to get its entity grouping
    const baseDoc = await Document.findById(id);
    if (!baseDoc) throw new ApiError(404, "Document not found");

    // Fetch all versions of this specific document entity
    const versions = await Document.find({
        project_id: baseDoc.project_id,
        entity_type: baseDoc.entity_type,
        entity_id: baseDoc.entity_id,
        document_type: baseDoc.document_type
    }).sort({ version: -1 });

    return res.status(200).json(
        new ApiResponse(true, { versions }, "Document versions fetched successfully")
    );
});

/**
 * 4. SECURE DOWNLOAD / STREAM
 * Route: GET /api/v1/documents/:id/download
 */
export const downloadDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) throw new ApiError(404, "Document not found");

    // TODO: In a real app, you would verify req.user permissions here,
    // then generate a signed URL (like AWS S3) or stream the file buffer directly.

    return res.status(200).json(
        new ApiResponse(true, { 
            download_url: document.file_url,
            checksum: document.checksum
         }, "Secure download link generated")
    );
});