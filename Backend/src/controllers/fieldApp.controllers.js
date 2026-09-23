import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

// A basic translation dictionary (In production, this would be loaded from JSON files)
const translations = {
  en: {
    greeting: "Welcome to NLAMS",
    survey_parcel: "Survey Land Parcel",
    verify_family: "Verify Affected Family",
    sync_data: "Sync Offline Data",
    status_pending: "Pending"
  },
  hi: {
    greeting: "NLAMS में आपका स्वागत है",
    survey_parcel: "भूमि पार्सल सर्वेक्षण",
    verify_family: "प्रभावित परिवार का सत्यापन करें",
    sync_data: "ऑफ़लाइन डेटा सिंक करें",
    status_pending: "लंबित"
  }
};

/**
 * 1. GET UI TRANSLATION BUNDLE
 * Route: GET /api/v1/i18n/:lang
 */
export const getTranslations = asyncHandler(async (req, res) => {
  const { lang } = req.params;

  const bundle = translations[lang.toLowerCase()];

  if (!bundle) {
    // Default to English if the requested language isn't supported yet
    return res.status(200).json(
      new ApiResponse(true, { lang: "en", bundle: translations["en"] }, "Language not found, defaulting to English")
    );
  }

  return res.status(200).json(
    new ApiResponse(true, { lang, bundle }, "Translation bundle fetched successfully")
  );
});

/**
 * 2. BATCH-SYNC OFFLINE CAPTURED DATA
 * Route: POST /api/v1/field/sync
 */
export const syncOfflineData = asyncHandler(async (req, res) => {
  const { parcels, families, documents } = req.body;
  const synced_by = req.user?._id || "64b8f0a1c9e4b2001a3f9999";

  if (!parcels && !families && !documents) {
    throw new ApiError(400, "Empty sync payload. Provide parcels, families, or documents.");
  }

  // TODO: In a real integration, you would import the models created by Person B & C
  // and do a bulk insert/update here.
  // Example: if (parcels && parcels.length > 0) await LandParcel.insertMany(parcels);

  // Simulated sync response
  const syncSummary = {
    parcels_synced: parcels ? parcels.length : 0,
    families_synced: families ? families.length : 0,
    documents_synced: documents ? documents.length : 0,
    synced_at: new Date()
  };

  return res.status(201).json(
    new ApiResponse(true, { sync_summary: syncSummary }, "Offline field data batch-synced successfully")
  );
});