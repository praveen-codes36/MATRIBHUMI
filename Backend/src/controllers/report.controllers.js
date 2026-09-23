import { ReportTemplate } from "../models/reportTemplate.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * 1. GET ALL SAVED REPORT TEMPLATES
 * Route: GET /api/v1/reports/templates
 */
export const getReportTemplates = asyncHandler(async (req, res) => {
  const templates = await ReportTemplate.find().sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(true, { count: templates.length, templates }, "Report templates fetched successfully")
  );
});

/**
 * 2. GENERATE A REPORT (PDF / EXCEL)
 * Route: POST /api/v1/reports/generate
 */
export const generateReport = asyncHandler(async (req, res) => {
  const { template_id, format, ad_hoc_config } = req.body;

  let reportConfig;

  // If a saved template ID is provided, fetch it. Otherwise, use the ad-hoc config provided in the body.
  if (template_id) {
    reportConfig = await ReportTemplate.findById(template_id);
    if (!reportConfig) {
      throw new ApiError(404, "Report template not found");
    }
  } else if (ad_hoc_config) {
    reportConfig = ad_hoc_config;
  } else {
    throw new ApiError(400, "Must provide either a template_id or an ad_hoc_config");
  }

  if (!format || !["PDF", "EXCEL"].includes(format.toUpperCase())) {
    throw new ApiError(400, "Invalid or missing format. Choose 'PDF' or 'EXCEL'");
  }

  // TODO: In a production environment, you would:
  // 1. Query the database (Projects, Compensation, etc.) using reportConfig.filters
  // 2. Select only the fields specified in reportConfig.columns
  // 3. Pass the data to a library like `pdfkit` (for PDFs) or `exceljs` (for Excel)
  // 4. Upload the generated file to S3 and return the secure URL

  // Simulated Report Generation
  const generatedFileUrl =
    format.toUpperCase() === "PDF"
      ? `https://nlams-storage.gov.in/reports/export_${Date.now()}.pdf`
      : `https://nlams-storage.gov.in/reports/export_${Date.now()}.xlsx`;

  return res.status(201).json(
    new ApiResponse(
      true,
      {
        report_url: generatedFileUrl,
        format: format.toUpperCase(),
        generated_at: new Date(),
        applied_config: {
          scope: reportConfig.scope,
          columns: reportConfig.columns
        }
      },
      `${format.toUpperCase()} report generated successfully`
    )
  );
});

/**
 * 3. SAVE A NEW REPORT TEMPLATE (Optional Bonus Route for completeness)
 * Route: POST /api/v1/reports/templates
 */
export const createReportTemplate = asyncHandler(async (req, res) => {
  const { name, scope, filters, columns } = req.body;
  const created_by = req.user?._id || "64b8f0a1c9e4b2001a3f9999"; // Replace with actual auth user

  if (!name || !scope || !columns) {
    throw new ApiError(400, "Missing required template fields: name, scope, columns");
  }

  const template = await ReportTemplate.create({
    name,
    scope,
    filters,
    columns,
    created_by
  });

  return res.status(201).json(
    new ApiResponse(true, { template }, "Report template saved successfully")
  );
});