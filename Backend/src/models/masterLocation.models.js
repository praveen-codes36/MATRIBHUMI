import mongoose from "mongoose";

const masterLocationSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["STATE", "DISTRICT", "VILLAGE"]
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    parent_code: {
        type: String,
        default: null
    },
    default_area_unit: {
        type: String,
        enum: ['ACRE', 'HECTARE', 'BIGHA', 'GUNTHA', 'SQ_METER'],
        default: 'ACRE'
    }, 

} , {timestamps: true});

export const MasterLocation = mongoose.model("MasterLocation", masterLocationSchema);