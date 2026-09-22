import mongoose from "mongoose";

const landRateScheduleSchema = new mongoose.Schema(
    {
        district_code: {
            type: String,
            required: true,
            ref: "MasterLocation"
        },
        land_type: {
            type: String,
            required: true,
            enum: ['AGRICULTURAL', 'COMMERCIAL', 'RESIDENTIAL', 'INDUSTRIAL']
        },
        circle_rate_per_unit: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            default: 'ACRE',
            required: true,
        },
        effective_from: {
            type: Date,
            required: true
        }
    }, { timestamps: true });

export const LandRateSchedule = mongoose.model("LandRateSchedule", landRateScheduleSchema);