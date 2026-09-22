import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, // Ref to User model
        required: true,
        index: true
    },
    entity_type: {
        type: String, // e.g., 'PROJECT', 'COMPENSATION', 'PARCEL', 'USER_ROLE'
        required: true,
        index: true
    },
    entity_id: {
        type: String, // The specific ID of the altered record
        required: true,
        index: true
    },
    action: {
        type: String, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'
        required: true
    },
    old_value: {
        type: mongoose.Schema.Types.Mixed, // Can hold any data structure
        default: null
    },
    new_value: {
        type: mongoose.Schema.Types.Mixed, 
        default: null
    },
    ip_address: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Automatically provides 'createdAt' as the timestamp

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);