import { z } from 'zod';
export const id = z.string().regex(/^[a-f\d]{24}$/i, 'Expected a MongoDB ObjectId');
const text = z.string().trim().min(1).max(500);
const note = z.string().trim().min(1).max(4000);
const positive = z.number().finite().positive();
const nonnegative = z.number().finite().nonnegative();
export const date = z.string().datetime({ offset: true });
const point = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const ring = z.array(point).min(4).max(5000).refine(r => r[0][0] === r.at(-1)[0] && r[0][1] === r.at(-1)[1], 'Polygon rings must be closed');
export const geometry = z.object({ type: z.literal('Polygon'), coordinates: z.array(ring).min(1).max(20) }).strict();
export const project = z.object({ code: text, name: text, ministry: text, state: text, district: text, acres: positive, budgetCr: nonnegative, description: note.optional(), leadOfficer: text.optional(), document_ids: z.array(id).max(50).default([]) }).strict();
export const parcel = z.object({ project_id: id, surveyNumber: text, village: text, areaAcres: positive, landType: z.enum(['Dry Agricultural','Wet Agricultural','Homestead','Industrial']), geometry: geometry.optional(), disputeNotes: note.optional(), disputed: z.boolean().default(false), document_ids: z.array(id).max(50).default([]) }).strict();
export const family = z.object({ _id: id.optional(), headOfFamily: text, familyMembersCount: z.number().int().min(1).max(100), scStStatus: z.enum(['SC','ST','General','OBC']), livelihoodLoss: z.enum(['Agricultural','Commercial','Homestead']) }).strict();
export const owner = z.object({ project_id: id, parcel_id: id, name: text, contact: z.string().trim().max(100).optional(), aadhaarMasked: z.string().regex(/^XXXX-XXXX-\d{4}$/).optional(), ownershipShare: z.number().positive().max(100), families: z.array(family).max(50).default([]), document_ids: z.array(id).max(50).default([]) }).strict();
export const notification = z.object({ project_id: id, reference: text, kind: z.enum(['PRELIMINARY','DECLARATION','PUBLIC_NOTICE']), title: text, body: note, document_ids: z.array(id).min(1).max(50), publicationDate: date.optional() }).strict();
export const possession = z.object({ project_id: id, parcel_id: id, scheduledDate: date, notes: note.optional() }).strict();
export const possessionUpdate = z.object({ status: z.enum(['SCHEDULED','TAKEN','HANDED_OVER']), scheduledDate: date.optional(), takenDate: date.optional(), handoverDate: date.optional(), receivingAgency: text.optional(), document_ids: z.array(id).max(50).optional(), notes: note.optional() }).strict();
export const rr = z.object({ project_id: id, owner_id: id, family_id: id, entitlement: note, resettlementHouseStatus: z.enum(['Pending Choice','In Construction','Allocated']).default('Pending Choice'), annuityGranted: z.boolean().default(false), trainingEnrolled: z.boolean().default(false), status: z.enum(['PLANNED','IN_PROGRESS','COMPLETED']).default('PLANNED'), document_ids: z.array(id).max(50).default([]) }).strict();
export const rrUpdate = rr.omit({ project_id:true, owner_id:true, family_id:true }).partial().extend({ completedDate: date.optional() }).strict();
export const decision = z.object({ expected_version: z.number().int().nonnegative(), remarks: note }).strict();
export const versionOnly = decision.omit({ remarks:true });
export const listQuery = z.object({ project_id: id.optional(), parcel_id:id.optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: text.optional() }).strict();
export function parse(schema, value) { return schema.parse(value); }
export function patchSchema(schema, excluded=[]) {
  return schema.omit(Object.fromEntries(excluded.map(k=>[k,true]))).partial().refine(v=>Object.keys(v).length>0,'At least one field is required');
}
