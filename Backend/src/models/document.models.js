import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        index: true
    },
    entity_type: {
        type: String,
        required: true,
        enum: ['PROJECT', 'PARCEL', 'AWARD', 'NOTIFICATION', 'POSSESSION', 'OTHER']
    },
    entity_id: {
        type: String, 
        required: true
    },
    document_type: {
        type: String,
        required: true
    },
    file_url: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        default: 1,
        required: true
    },
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    checksum: {
        type: String,
        required: true
    }
}, { timestamps: { createdAt: 'uploaded_at', updatedAt: true } }); // Maps uploaded_at

export const Document = mongoose.model("Document", documentSchema);