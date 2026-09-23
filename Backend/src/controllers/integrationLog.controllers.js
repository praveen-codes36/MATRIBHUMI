import { IntegrationLog } from "../models/integrationLog.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { MasterLocation } from "../models/masterLocation.models.js";

/**
 * 1. PULL LAND RECORD DATA FROM EXTERNAL STATE SYSTEM (e.g., Bhulekh)
 * Route: GET /api/v1/integration/land-records/:parcelId
 */
export const getLandRecordsData = asyncHandler(async (req, res) => {
  const { parcelId } = req.params;

  if (!parcelId) {
    throw new ApiError(400, "Parcel ID parameter is required");
  }

  // Simulated external call to State Land Records database
  const requestPayload = { parcel_id: parcelId, requested_at: new Date() };

  // Mocked external system response (In production, replace with Axios call to state API)
  const simulatedExternalResponse = {
    external_khasra_no: `KH-${parcelId}-2026`,
    owner_name_in_records: "Ram Kumar",
    registered_area_sqm: 8093.72,
    land_category: "AGRICULTURAL",
    encumbrance_status: "CLEAR"
  };

  // Record integration transaction
  await IntegrationLog.create({
    system: "LAND_RECORDS",
    request_payload: requestPayload,
    response_payload: simulatedExternalResponse,
    status: "SUCCESS"
  });

  return res.status(200).json(
    new ApiResponse(
      true,
      { parcel_id: parcelId, record_data: simulatedExternalResponse },
      "Land record data successfully pulled from external system"
    )
  );
});

/**
 * 2. PUSH PAYMENT INSTRUCTION TO PFMS (Public Financial Management System)
 * Route: POST /api/v1/integration/pfms/disburse
 */
export const disbursePFMS = asyncHandler(async (req, res) => {
  const { payment_id, owner_id, amount, bank_account, ifsc_code } = req.body;

  if (!payment_id || !owner_id || !amount || !bank_account || !ifsc_code) {
    throw new ApiError(400, "Missing required PFMS disbursement parameters");
  }

  const requestPayload = { payment_id, owner_id, amount, bank_account, ifsc_code };

  // Simulated PFMS Payment Gateway Response
  const simulatedPFMSResponse = {
    pfms_transaction_ref: `PFMS-TXN-${Date.now()}`,
    status: "SUCCESS",
    disbursement_date: new Date(),
    acknowledgement_code: "ACK_200_OK"
  };

  // Record integration transaction
  await IntegrationLog.create({
    system: "PFMS",
    request_payload: requestPayload,
    response_payload: simulatedPFMSResponse,
    status: "SUCCESS"
  });

  return res.status(200).json(
    new ApiResponse(
      true,
      { pfms_result: simulatedPFMSResponse },
      "Payment instruction successfully pushed to PFMS"
    )
  );
});

/**
 * 3. FETCH CADASTRAL MAP OVERLAY TILES FROM EXTERNAL GEOSERVER / GIS PORTAL
 * Route: GET /api/v1/integration/gis/overlay/:districtCode
 */
export const getGISOverlay = asyncHandler(async (req, res) => {
  const { districtCode } = req.params;



  if (!districtCode) {
    throw new ApiError(400, "District code parameter is required");
  }

  const isValidDistrict = await MasterLocation.exists({ type: "DISTRICT", code: districtCode });

  if (!isValidDistrict) {
    throw new ApiError(400, "Invalid district code provided");
  }

  const requestPayload = { district_code: districtCode, service: "WMS_GET_MAP" };

  // Mocked response providing GeoServer WMS tile/layer configurations
  const simulatedGISResponse = {
    district_code: districtCode,
    wms_endpoint: `https://geoserver.gov.in/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=cadastral:${districtCode}`,
    supported_formats: ["image/png", "application/json"],
    bounds: [81.8, 25.4, 82.1, 25.6]
  };

  // Record integration transaction
  await IntegrationLog.create({
    system: "CADASTRAL",
    request_payload: requestPayload,
    response_payload: simulatedGISResponse,
    status: "SUCCESS"
  });

  return res.status(200).json(
    new ApiResponse(
      true,
      { overlay_config: simulatedGISResponse },
      "GIS overlay configurations fetched successfully"
    )
  );
});