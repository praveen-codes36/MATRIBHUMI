import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ["SLA_BREACH", "COMPENSATION_DUE", "MILESTONE", "DISPUTE"]
    },
    message: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM"
    },
    channel: {
      type: String,
      enum: ["SMS", "EMAIL", "PUSH", "IN_APP"],
      default: "IN_APP"
    },
    is_read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: { createdAt: "created_at", updatedAt: true } }
);

export const Alert = mongoose.model("Alert", alertSchema);