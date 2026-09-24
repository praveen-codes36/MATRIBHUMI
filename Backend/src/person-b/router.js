import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Project,Parcel,Owner,Notification,Possession,Rehabilitation,Outbox } from './models.js';
import * as V from './validation.js';
import { scope,checkJurisdiction,requireRoles,roles } from './access.js';
import { integrations as liveIntegrations } from './integrations.js';
import { ApiError } from '../utils/api-error.js';
const managers=['CENTRAL_ADMIN','STATE_ADMIN','DISTRICT_COLLECTOR'];
const staff=[...managers,'FIELD_OFFICER'];
const fail=(status,message)=>{throw new ApiError(status,message);};
const editable=p=>{if(!['DRAFT','REJECTED'].includes(p.status)) fail(409,'Proposal and land data are locked after submission');};
const active=p=>{if(p.status==='ARCHIVED') fail(409,'Project is archived');};
const approved=p=>{if(p.status!=='APPROVED') fail(409,'Project must be approved');};
const same=(a,b)=>String(a)===String(b);
const plain=d=>d?.toObject?d.toObject():d;
function version(p,v) { if(p.__v!==v) fail(409,'Stale version: reload the project and retry'); }
async function getProject(projectId,user,session,write=false) {
  V.id.parse(String(projectId));
  // Writing a project lock serializes related writes and prevents submit/archive races.
  const p=write?await Project.findOneAndUpdate({$and:[{_id:projectId},scope(user)]},{$inc:{lock_version:1}},{new:true,session}):await Project.findOne({$and:[{_id:projectId},scope(user)]}).session(session||null);
  if(!p) fail(404,'Project not found in your jurisdiction');
  return p;
}
async function getRecord(Model,recordId,user,session,write=false) {
  V.id.parse(recordId);
  const item=await Model.findById(recordId).session(session||null);
  if(!item) fail(404,'Record not found');
  const p=await getProject(item.project_id,user,session,write);
  return {item,p};
}
async function event(session,req,p,item,name,payload={}) {
  await Outbox.create([{project_id:p._id,aggregate_id:item._id,event:name,actor_id:req.user._id,payload:{...payload,record_version:item.__v,status:item.status}}],{session});
}
function history(p,user,to,action,remarks) {
  p.history.push({actor_id:user._id,from:p.status,to,action,remarks});p.status=to;
}
export function createPersonBRouter({authenticate,integrations=liveIntegrations}) {
  const r=Router();
  r.use(authenticate,requireRoles(...roles));
  const read=(handler)=>(req,res,next)=>Promise.resolve(handler(req)).then(data=>res.json({success:true,statusCode:200,data})).catch(next);
  const write=(handler,status=200)=>async(req,res,next)=>{
    try {
      const data=await mongoose.connection.transaction(session=>handler(req,session));
      res.status(status).json({success:true,statusCode:status,data});
    } catch(e){next(e);}
  };
  async function list(req,Model,extra={}) {
    const q=V.listQuery.parse(req.query);
    let filter;
    if(Model===Project) { if(q.parcel_id) fail(400,'parcel_id is not a project filter'); filter={$and:[scope(req.user),...(q.project_id?[{_id:q.project_id}]:[])],...extra}; }
    else {
      const projects=await Project.find(scope(req.user)).select('_id').lean();
      filter={project_id:{$in:projects.map(p=>p._id)},...extra};
      if(q.project_id) {await getProject(q.project_id,req.user);filter.project_id=q.project_id;}
      if(q.parcel_id) filter.parcel_id=q.parcel_id;
    }
    if(q.status) filter.status=q.status;
    const [items,total]=await Promise.all([Model.find(filter).sort({createdAt:-1,_id:-1}).skip((q.page-1)*q.limit).limit(q.limit).lean(),Model.countDocuments(filter)]);
    return {items,total,page:q.page,limit:q.limit};
  }
  // 3.3 Projects: six routes.
  r.get('/projects',read(req=>list(req,Project)));
  r.post('/projects',requireRoles(...managers),write(async(req,s)=>{
    const data=V.project.parse(req.body);checkJurisdiction(req.user,data);
    const projectId = new mongoose.Types.ObjectId();
    if(data.document_ids.length) fail(400,'Create the project first, then attach verified documents with PATCH');
    const [p]=await Project.create([{...data,_id:projectId,created_by:req.user._id}],{session:s});
    await event(s,req,p,p,'project.created');return p;
  },201));
  r.get('/projects/:id',read(async req=>{
    const p=await getProject(req.params.id,req.user);
    const [parcelsCount,takenCount]=await Promise.all([Parcel.countDocuments({project_id:p._id}),Possession.countDocuments({project_id:p._id,status:{$in:['TAKEN','HANDED_OVER']}})]);
    return {...plain(p),project_id:p._id,parcelsCount,possession_pct:parcelsCount?100*takenCount/parcelsCount:0};
  }));
  r.patch('/projects/:id',requireRoles(...managers),write(async(req,s)=>{
    const data=V.patchSchema(V.project,['code','state','district']).parse(req.body);
    const p=await getProject(req.params.id,req.user,s,true);editable(p);
    if(data.document_ids) await integrations.verifyDocuments(data.document_ids,p._id);
    Object.assign(p,data);await p.save({session:s});await event(s,req,p,p,'project.updated');return p;
  }));
  r.post('/projects/:id/submit',requireRoles(...managers),write(async(req,s)=>{
    const body=V.versionOnly.parse(req.body);const p=await getProject(req.params.id,req.user,s,true);editable(p);version(p,body.expected_version);
    if(!await Parcel.exists({project_id:p._id}).session(s)) fail(409,'Add at least one parcel before submission');
    history(p,req.user,'DISTRICT_REVIEW','SUBMIT','Submitted for review');await p.save({session:s});await event(s,req,p,p,'project.submitted');return p;
  }));
  r.post('/projects/:id/archive',requireRoles(...managers),write(async(req,s)=>{
    const body=V.decision.parse(req.body);const p=await getProject(req.params.id,req.user,s,true);editable(p);version(p,body.expected_version);
    history(p,req.user,'ARCHIVED','ARCHIVE',body.remarks);await p.save({session:s});await event(s,req,p,p,'project.archived');return p;
  }));
  // 3.4 Approval engine: five routes. Decisions and history commit together.
  r.get('/approvals/inbox',requireRoles(...managers),read(req=>{
    const status={DISTRICT_COLLECTOR:'DISTRICT_REVIEW',STATE_ADMIN:'STATE_REVIEW',CENTRAL_ADMIN:'CENTRAL_REVIEW'}[req.user.role];
    if(req.query.status && req.query.status!==status) fail(400,'Inbox status is determined by your role');
    return list(req,Project,{status});
  }));
  r.get('/projects/:id/workflow',read(async req=>{const p=await getProject(req.params.id,req.user);return {project_id:p._id,status:p.status,version:p.__v};}));
  r.get('/projects/:id/approval-history',read(async req=>(await getProject(req.params.id,req.user)).history));
  for(const action of ['approve','reject']) r.post(`/projects/:id/${action}`,requireRoles(...managers),write(async(req,s)=>{
    const body=V.decision.parse(req.body);const p=await getProject(req.params.id,req.user,s,true);version(p,body.expected_version);
    const expected={DISTRICT_REVIEW:'DISTRICT_COLLECTOR',STATE_REVIEW:'STATE_ADMIN',CENTRAL_REVIEW:'CENTRAL_ADMIN'}[p.status];
    if(!expected) fail(409,'No approval is pending');
    if(req.user.role!==expected) fail(403,'Only the current approval authority can decide');
    if(same(p.created_by,req.user._id)) fail(403,'The proposal creator cannot approve or reject their own proposal');
    const to=action==='reject'?'REJECTED':{DISTRICT_REVIEW:'STATE_REVIEW',STATE_REVIEW:'CENTRAL_REVIEW',CENTRAL_REVIEW:'APPROVED'}[p.status];
    history(p,req.user,to,action.toUpperCase(),body.remarks);await p.save({session:s});await event(s,req,p,p,`project.${action}`,{status:to});return p;
  }));
  // 3.5 Parcels/GIS: six routes. GeoJSON uses longitude, latitude (WGS84).
  r.get('/parcels',requireRoles(...staff),read(req=>list(req,Parcel)));
  r.post('/parcels',requireRoles(...staff),write(async(req,s)=>{
    const data=V.parcel.parse(req.body);const p=await getProject(data.project_id,req.user,s,true);editable(p);
    if(data.document_ids.length) await integrations.verifyDocuments(data.document_ids,p._id);
    const [item]=await Parcel.create([data],{session:s});await event(s,req,p,item,'parcel.created');return item;
  },201));
  r.get('/parcels/geojson',requireRoles(...staff),read(async req=>{
    const result=await list(req,Parcel);return {type:'FeatureCollection',features:result.items.filter(p=>p.geometry).map(p=>({type:'Feature',id:p._id,geometry:p.geometry,properties:{parcel_id:p._id,project_id:p.project_id,surveyNumber:p.surveyNumber,village:p.village,areaAcres:p.areaAcres,disputed:p.disputed}})),pagination:{page:result.page,limit:result.limit,total:result.total}};
  }));
  r.get('/parcels/:id',requireRoles(...staff),read(async req=>(await getRecord(Parcel,req.params.id,req.user)).item));
  r.patch('/parcels/:id',requireRoles(...staff),write(async(req,s)=>{
    const data=V.patchSchema(V.parcel,['project_id','geometry']).parse(req.body);const {item,p}=await getRecord(Parcel,req.params.id,req.user,s,true);
    if(p.status==='APPROVED') {
      if(!managers.includes(req.user.role)) fail(403,'Only a manager can update an approved parcel dispute');
      if(Object.keys(data).some(k=>!['disputed','disputeNotes','document_ids'].includes(k))) fail(409,'Approved land data are immutable; only dispute evidence can change');
      if(item.disputed && data.disputed===false && !data.document_ids?.length) fail(400,'Verified resolution documents are required');
    } else editable(p);
    if(data.document_ids) await integrations.verifyDocuments(data.document_ids,p._id);
    Object.assign(item,data);await item.save({session:s});await event(s,req,p,item,'parcel.updated');return item;
  }));
  r.put('/parcels/:id/geometry',requireRoles(...staff),write(async(req,s)=>{
    const geometry=V.geometry.parse(req.body);const {item,p}=await getRecord(Parcel,req.params.id,req.user,s,true);editable(p);item.geometry=geometry;
    await item.save({session:s});await event(s,req,p,item,'parcel.geometry_updated');return item;
  }));
  // 3.6 Owners with affected-family subdocuments: four routes.
  r.get('/owners',requireRoles(...staff),read(req=>list(req,Owner)));
  r.get('/owners/:id',requireRoles(...staff),read(async req=>(await getRecord(Owner,req.params.id,req.user)).item));
  async function validateOwner(data,p,s,existing) {
    const parcel=await Parcel.findOne({_id:data.parcel_id,project_id:p._id}).session(s);if(!parcel) fail(400,'Parcel does not belong to this project');
    const others=await Owner.find({parcel_id:data.parcel_id,...(existing?{_id:{$ne:existing._id}}:{})}).session(s);
    if(others.reduce((n,o)=>n+o.ownershipShare,0)+data.ownershipShare>100.000001) fail(409,'Ownership shares exceed 100 percent');
    const familyIds=(data.families||[]).filter(f=>f._id).map(f=>String(f._id));
    if(new Set(familyIds).size!==familyIds.length) fail(400,'Duplicate family IDs');
    if(familyIds.some(id=>!existing?.families.some(f=>same(f._id,id)))) fail(400,'New family IDs are generated by the server');
  }
  r.post('/owners',requireRoles(...staff),write(async(req,s)=>{
    const data=V.owner.parse(req.body);const p=await getProject(data.project_id,req.user,s,true);editable(p);await validateOwner(data,p,s);
    if(data.document_ids.length) await integrations.verifyDocuments(data.document_ids,p._id);
    const [item]=await Owner.create([data],{session:s});await event(s,req,p,item,'owner.created');return item;
  },201));
  r.patch('/owners/:id',requireRoles(...staff),write(async(req,s)=>{
    const data=V.patchSchema(V.owner,['project_id','parcel_id']).parse(req.body);const {item,p}=await getRecord(Owner,req.params.id,req.user,s,true);editable(p);
    await validateOwner({...plain(item),...data},p,s,item);
    if(data.document_ids) await integrations.verifyDocuments(data.document_ids,p._id);
    Object.assign(item,data);await item.save({session:s});await event(s,req,p,item,'owner.updated');return item;
  }));
  // 3.7 Official notification register: four routes. Publishing records verified evidence;
  // it does not claim to publish in an actual government gazette.
  r.get('/notifications',read(req=>list(req,Notification)));
  r.get('/notifications/:id',read(async req=>(await getRecord(Notification,req.params.id,req.user)).item));
  r.post('/notifications',requireRoles(...managers),write(async(req,s)=>{
    const data=V.notification.parse(req.body);const p=await getProject(data.project_id,req.user,s,true);approved(p);
    await integrations.verifyDocuments(data.document_ids,p._id);
    const [item]=await Notification.create([data],{session:s});await event(s,req,p,item,'notification.created');return item;
  },201));
  r.post('/notifications/:id/publish',requireRoles(...managers),write(async(req,s)=>{
    const body=z.object({publicationDate:V.date}).strict().parse(req.body);const {item,p}=await getRecord(Notification,req.params.id,req.user,s,true);approved(p);
    if(item.status!=='DRAFT') fail(409,'Notification already published');
    if(new Date(body.publicationDate)>new Date()) fail(400,'Publication date cannot be in the future');
    await integrations.verifyDocuments(item.document_ids.map(String),p._id);
    item.status='PUBLISHED';item.publicationDate=body.publicationDate;item.publishedAt=new Date();item.publishedBy=req.user._id;
    await item.save({session:s});await event(s,req,p,item,'notification.published');return item;
  }));
  // 3.11 Possession: three routes. Clearance is verified with Person C, never client flags.
  r.get('/possessions',requireRoles(...staff),read(req=>list(req,Possession)));
  r.post('/possessions',requireRoles(...managers),write(async(req,s)=>{
    const data=V.possession.parse(req.body);const p=await getProject(data.project_id,req.user,s,true);approved(p);
    if(!await Parcel.exists({_id:data.parcel_id,project_id:p._id}).session(s)) fail(400,'Parcel does not belong to this project');
    const [item]=await Possession.create([data],{session:s});await event(s,req,p,item,'possession.scheduled');return item;
  },201));
  r.patch('/possessions/:id',requireRoles(...managers),write(async(req,s)=>{
    const data=V.possessionUpdate.parse(req.body);const {item,p}=await getRecord(Possession,req.params.id,req.user,s,true);approved(p);
    const allowed={SCHEDULED:['SCHEDULED','TAKEN'],TAKEN:['HANDED_OVER'],HANDED_OVER:[]};
    if(!allowed[item.status].includes(data.status)) fail(409,'Invalid possession transition');
    const parcel=await Parcel.findById(item.parcel_id).session(s);
    if(data.status==='TAKEN') {
      if(parcel.disputed) fail(409,'Resolve the parcel dispute before taking possession');
      if(!data.takenDate || new Date(data.takenDate)>new Date() || !data.document_ids?.length) fail(400,'Taken date (not future) and possession documents are required');
      await integrations.verifyPossession(item.parcel_id,p._id);await integrations.verifyDocuments(data.document_ids,p._id);
    }
    if(data.status==='HANDED_OVER') {
      if(!data.handoverDate || !data.receivingAgency || !data.document_ids?.length || new Date(data.handoverDate)<item.takenDate || new Date(data.handoverDate)>new Date()) fail(400,'Valid handover date, agency and documents are required');
      await integrations.verifyDocuments(data.document_ids,p._id);
    }
    if(data.status==='SCHEDULED' && ['takenDate','handoverDate','receivingAgency','document_ids'].some(k=>data[k]!==undefined)) fail(400,'Completion evidence is only accepted with its transition');
    if(data.status==='TAKEN' && (data.handoverDate||data.receivingAgency)) fail(400,'Handover evidence requires HANDED_OVER');
    if(data.status==='HANDED_OVER' && (data.takenDate||data.scheduledDate)) fail(400,'Earlier possession dates are immutable');
    Object.assign(item,data);await item.save({session:s});parcel.possessionStatus=item.status;await parcel.save({session:s});await event(s,req,p,item,'possession.updated',{status:item.status});return item;
  }));
  // 3.12 R&R: three routes. Benefits are tracked, not automatically legally assessed.
  r.get('/rehabilitations',requireRoles(...staff),read(req=>list(req,Rehabilitation)));
  r.post('/rehabilitations',requireRoles(...managers),write(async(req,s)=>{
    const data=V.rr.parse(req.body);const p=await getProject(data.project_id,req.user,s,true);approved(p);
    if(data.status!=='PLANNED') fail(400,'New R&R records must start PLANNED');
    const owner=await Owner.findOne({_id:data.owner_id,project_id:p._id}).session(s);
    if(!owner?.families.some(f=>same(f._id,data.family_id))) fail(400,'Family does not belong to this owner/project');
    if(data.document_ids.length) await integrations.verifyDocuments(data.document_ids,p._id);
    const [item]=await Rehabilitation.create([data],{session:s});await event(s,req,p,item,'rehabilitation.created');return item;
  },201));
  r.patch('/rehabilitations/:id',requireRoles(...managers),write(async(req,s)=>{
    const data=V.rrUpdate.refine(d=>Object.keys(d).length>0,'At least one field is required').parse(req.body);const {item,p}=await getRecord(Rehabilitation,req.params.id,req.user,s,true);active(p);
    if(item.status==='COMPLETED') fail(409,'Completed R&R records are immutable');
    const status=data.status||item.status;
    if(item.status==='IN_PROGRESS' && status==='PLANNED') fail(409,'Cannot reverse R&R progress');
    if(status==='COMPLETED' && (item.status!=='IN_PROGRESS'||!data.completedDate||new Date(data.completedDate)>new Date()||!data.document_ids?.length)) fail(400,'Completion requires IN_PROGRESS, completion date and evidence');
    if(status!=='COMPLETED' && data.completedDate) fail(400,'completedDate requires COMPLETED');
    if(data.document_ids) await integrations.verifyDocuments(data.document_ids,p._id);
    Object.assign(item,data);await item.save({session:s});await event(s,req,p,item,'rehabilitation.updated',{status});return item;
  }));
  return r;
}
