import mongoose from "mongoose";

const reportTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    scope: {
      type: String,
      required: true,
      enum: ["NATIONAL", "STATE", "DISTRICT", "PROJECT"]
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    columns: {
      type: [String], // e.g., ["project_name", "land_acquired", "compensation_paid"]
      required: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const ReportTemplate = mongoose.model("ReportTemplate", reportTemplateSchema);