import mongoose from "mongoose";

const integrationLogSchema = new mongoose.Schema(
  {
    system: {
      type: String,
      required: true,
      enum: ["LAND_RECORDS", "CADASTRAL", "PFMS", "GIS_PORTAL"]
    },
    request_payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    response_payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      required: true,
      enum: ["SUCCESS", "FAILED", "PENDING"]
    }
  },
  { timestamps: { createdAt: "called_at", updatedAt: true } }
);

export const IntegrationLog = mongoose.model("IntegrationLog", integrationLogSchema);