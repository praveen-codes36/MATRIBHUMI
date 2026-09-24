import { ApiError } from '../utils/api-error.js';
export const roles = ['CENTRAL_ADMIN','STATE_ADMIN','DISTRICT_COLLECTOR','FIELD_OFFICER','POLICY_MAKER'];
export function requireRoles(...allowed) {
  return (req,res,next) => allowed.includes(req.user?.role) ? next() : next(new ApiError(403,'This role cannot perform this action'));
}
export function scope(user) {
  if (!roles.includes(user?.role)) throw new ApiError(403,'Person A must assign an official role to this user');
  if (['CENTRAL_ADMIN','POLICY_MAKER'].includes(user.role)) return {};
  if (!user.state) throw new ApiError(403,'User has no state jurisdiction');
  if (user.role === 'STATE_ADMIN') return {state:user.state};
  if (!user.district) throw new ApiError(403,'User has no district jurisdiction');
  if (user.role === 'FIELD_OFFICER') return {state:user.state,district:user.district,_id:{$in:user.project_ids || []}};
  return {state:user.state,district:user.district};
}
export function checkJurisdiction(user,project) {
  const s=scope(user);
  if ((s.state && s.state!==project.state) || (s.district && s.district!==project.district) || (s._id && !s._id.$in.some(id=>String(id)===String(project._id)))) throw new ApiError(403,'Outside assigned jurisdiction');
}
