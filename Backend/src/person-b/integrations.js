import { ApiError } from '../utils/api-error.js';
// INTEGRATION_TODO (A/C): these are proposed HTTP contracts, not supplied in the PDF.
// No mock success fallback. Missing services block actions requiring external evidence.
async function request(base,path) {
  if (!base || !process.env.INTEGRATION_SERVICE_TOKEN) throw new ApiError(503,'Required integration service is not configured');
  let response;
  try { response=await fetch(new URL(path,base),{headers:{Authorization:`Bearer ${process.env.INTEGRATION_SERVICE_TOKEN}`},signal:AbortSignal.timeout(5000)}); }
  catch { throw new ApiError(503,'Integration service unavailable'); }
  if (!response.ok) throw new ApiError(503,'Integration service rejected the evidence check');
  try { return await response.json(); } catch { throw new ApiError(503,'Invalid integration response'); }
}
export const integrations = {
  async verifyDocuments(ids,projectId) {
    for (const id of ids) {
      const result=await request(process.env.PERSON_A_BASE_URL,`api/v1/documents/${id}/verification?project_id=${projectId}`);
      if (result?.data?.verified!==true || result.data.project_id!==String(projectId)) throw new ApiError(409,'Document not verified for this project');
    }
  },
  async verifyPossession(parcelId,projectId) {
    const result=await request(process.env.PERSON_C_BASE_URL,`api/v1/parcels/${parcelId}/possession-clearance`);
    if (result?.data?.parcel_id!==String(parcelId) || result.data.project_id!==String(projectId) || result.data.cleared!==true || !result.data.award_id) throw new ApiError(409,'Person C has not cleared this parcel for possession');
  }
};
