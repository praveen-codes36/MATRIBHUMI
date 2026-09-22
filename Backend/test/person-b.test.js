import { before,after,test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/users.models.js';
import { verifyJWT } from '../src/middlewares/auth.middleware.js';
import { createPersonBRouter } from '../src/person-b/router.js';
import { errorHandler } from '../src/person-b/errors.js';
import { models,Project,Parcel,Owner,Outbox } from '../src/person-b/models.js';
import { integrations } from '../src/person-b/integrations.js';
let repl,app,token={},users={},project,parcel,owner,possession,rr,notification;
const oid=()=>new mongoose.Types.ObjectId().toString();
// MOCK_REPLACE: test-only evidence adapters. Production router uses real HTTP checks.
let clearance=true, documents=true;
const adapters={verifyDocuments:async()=>{if(!documents) throw Object.assign(new Error('Document service down'),{statusCode:503});},verifyPossession:async()=>{if(!clearance) throw Object.assign(new Error('Not cleared'),{statusCode:409});}};
const call=(method,path,who='creator',body)=>{let r=request(app)[method]('/api/v1'+path);if(who)r=r.set('Authorization',`Bearer ${token[who]}`);return body===undefined?r:r.send(body);};
const expectData=async(p,status=200)=>{const r=await p;assert.equal(r.status,status,JSON.stringify(r.body));return r.body.data;};
before(async()=>{
  repl=await MongoMemoryReplSet.create({replSet:{count:1},binary:{version:'7.0.24'}});
  await mongoose.connect(repl.getUri());await Promise.all([...models,User].map(m=>m.init()));
  process.env.ACCESS_TOKEN_SECRET='test-only-secret-not-a-deployment-secret';
  // MOCK_REPLACE: isolated test accounts; no deployed authentication bypass.
  for(const [key,role,state,district] of [['creator','DISTRICT_COLLECTOR','UP','Prayagraj'],['district','DISTRICT_COLLECTOR','UP','Prayagraj'],['state','STATE_ADMIN','UP'],['central','CENTRAL_ADMIN'],['field','FIELD_OFFICER','UP','Prayagraj'],['outside','DISTRICT_COLLECTOR','MP','Bhopal'],['policy','POLICY_MAKER'],['member','member']]) {
    const user=await User.create({username:key,email:`${key}@example.test`,password:'test-only-password',role,state,district});users[key]=user;token[key]=jwt.sign({_id:user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
  }
  app=express();app.use(express.json());app.use('/api/v1',createPersonBRouter({authenticate:verifyJWT,integrations:adapters}));app.use(errorHandler);
});
after(async()=>{await mongoose.disconnect();if(repl)await repl.stop();});
test('unauthenticated, ordinary member and policy writes denied',async()=>{
  assert.equal((await call('get','/projects',null)).status,401);
  assert.equal((await call('get','/projects','member')).status,403);
  assert.equal((await call('post','/projects','policy',{})).status,403);
});
test('project validation, creation, list and isolation',async()=>{
  const input={code:'TEST-01',name:'Test road',ministry:'Test Ministry',state:'UP',district:'Prayagraj',acres:10,budgetCr:1};
  assert.equal((await call('post','/projects','creator',{...input,status:'APPROVED'})).status,400);
  project=await expectData(call('post','/projects','creator',input),201);
  assert.equal((await call('post','/projects','creator',input)).status,409);
  assert.equal((await call('get',`/projects/${project._id}`,'outside')).status,404);
  assert.equal((await expectData(call('get','/projects','outside'))).total,0);
  assert.equal((await call('get',`/projects/${project._id}`,'field')).status,404);
  assert.equal((await expectData(call('get',`/projects?project_id=${project._id}`,'field'))).total,0);
  assert.equal((await call('get','/projects?limit=999','creator')).status,400);
  project=await expectData(call('patch',`/projects/${project._id}`,'creator',{description:'Updated proposal'}));
});
test('parcels, field assignment, GIS validation and paginated GeoJSON',async()=>{
  const input={project_id:project._id,surveyNumber:'1A',village:'Test Village',areaAcres:2,landType:'Dry Agricultural'};
  parcel=await expectData(call('post','/parcels','creator',input),201);
  assert.equal((await call('post','/parcels','creator',input)).status,409);
  await User.updateOne({_id:users.field._id},{$set:{project_ids:[project._id]}});
  await expectData(call('get',`/parcels/${parcel._id}`,'field'));
  assert.equal((await call('put',`/parcels/${parcel._id}/geometry`,'field',{type:'Polygon',coordinates:[[[181,0],[1,1],[2,2],[181,0]]]})).status,400);
  parcel=await expectData(call('put',`/parcels/${parcel._id}/geometry`,'field',{type:'Polygon',coordinates:[[[80,25],[80.01,25],[80.01,25.01],[80,25]]]}));
  assert.equal((await expectData(call('get',`/parcels/geojson?project_id=${project._id}`))).features.length,1);
  await expectData(call('patch',`/parcels/${parcel._id}`,'field',{areaAcres:3}));
});
test('owners, families, share limits, invalid cross-project references',async()=>{
  const input={project_id:project._id,parcel_id:parcel._id,name:'Test Owner',ownershipShare:100,aadhaarMasked:'XXXX-XXXX-1234',families:[{headOfFamily:'Test Family',familyMembersCount:3,scStStatus:'General',livelihoodLoss:'Agricultural'}]};
  assert.equal((await call('post','/owners','creator',{...input,parcel_id:oid()})).status,400);
  owner=await expectData(call('post','/owners','creator',input),201);
  assert.equal((await call('post','/owners','creator',input)).status,409);
  assert.equal((await call('post','/owners','creator',{...input,aadhaarMasked:'123456789012'})).status,400);
  owner=await expectData(call('patch',`/owners/${owner._id}`,'creator',{contact:'test contact'}));
  await expectData(call('get',`/owners/${owner._id}`));await expectData(call('get',`/owners?project_id=${project._id}`));
  assert.equal((await call('get','/owners','policy')).status,403);
});
test('approval authority, stale version, self-approval, frozen data, concurrency',async()=>{
  project=await expectData(call('post',`/projects/${project._id}/submit`,'creator',{expected_version:project.__v}));
  assert.equal((await call('patch',`/parcels/${parcel._id}`,'field',{areaAcres:4})).status,409);
  const body={expected_version:project.__v,remarks:'Reviewed'};
  assert.equal((await call('post',`/projects/${project._id}/approve`,'creator',body)).status,403);
  assert.equal((await call('post',`/projects/${project._id}/approve`,'central',body)).status,403);
  const responses=await Promise.all([call('post',`/projects/${project._id}/approve`,'district',body),call('post',`/projects/${project._id}/approve`,'district',body)]);
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);project=responses.find(r=>r.status===200).body.data;
  await expectData(call('get','/approvals/inbox','state'));
  project=await expectData(call('post',`/projects/${project._id}/approve`,'state',{expected_version:project.__v,remarks:'State reviewed'}));
  project=await expectData(call('post',`/projects/${project._id}/approve`,'central',{expected_version:project.__v,remarks:'Central reviewed'}));
  assert.equal(project.status,'APPROVED');
  assert.equal((await expectData(call('get',`/projects/${project._id}/approval-history`))).length,4);
  assert.equal((await expectData(call('get',`/projects/${project._id}/workflow`))).status,'APPROVED');
});
test('notifications fail closed, publish once and scope lists',async()=>{
  const body={project_id:project._id,reference:'TEST-N1',kind:'PUBLIC_NOTICE',title:'Test notification',body:'Test notice content',document_ids:[oid()]};
  documents=false;assert.equal((await call('post','/notifications','creator',body)).status,503);documents=true;
  notification=await expectData(call('post','/notifications','creator',body),201);
  notification=await expectData(call('post',`/notifications/${notification._id}/publish`,'creator',{publicationDate:new Date().toISOString()}));
  assert.equal(notification.status,'PUBLISHED');assert.equal((await call('post',`/notifications/${notification._id}/publish`,'creator',{publicationDate:new Date().toISOString()})).status,409);
  await expectData(call('get',`/notifications/${notification._id}`));await expectData(call('get','/notifications'));
});
test('possession gates, rollback, handover and aggregate progress',async()=>{
  possession=await expectData(call('post','/possessions','creator',{project_id:project._id,parcel_id:parcel._id,scheduledDate:new Date().toISOString()}),201);
  const body={status:'TAKEN',takenDate:new Date().toISOString(),document_ids:[oid()]};
  clearance=false;assert.equal((await call('patch',`/possessions/${possession._id}`,'creator',body)).status,409);
  assert.equal((await Parcel.findById(parcel._id)).possessionStatus,'NOT_STARTED');
  clearance=true;possession=await expectData(call('patch',`/possessions/${possession._id}`,'creator',body));
  possession=await expectData(call('patch',`/possessions/${possession._id}`,'creator',{status:'HANDED_OVER',handoverDate:new Date().toISOString(),receivingAgency:'Test agency',document_ids:[oid()]}));
  assert.equal((await expectData(call('get',`/projects/${project._id}`))).possession_pct,100);
  await expectData(call('get','/possessions'));
});
test('R&R family references, progress and completion evidence',async()=>{
  const input={project_id:project._id,owner_id:owner._id,family_id:owner.families[0]._id,entitlement:'Test housing support'};
  assert.equal((await call('post','/rehabilitations','creator',{...input,family_id:oid()})).status,400);
  rr=await expectData(call('post','/rehabilitations','creator',input),201);
  assert.equal((await call('post','/rehabilitations','creator',input)).status,409);
  rr=await expectData(call('patch',`/rehabilitations/${rr._id}`,'creator',{status:'IN_PROGRESS'}));
  assert.equal((await call('patch',`/rehabilitations/${rr._id}`,'creator',{status:'COMPLETED'})).status,400);
  rr=await expectData(call('patch',`/rehabilitations/${rr._id}`,'creator',{status:'COMPLETED',completedDate:new Date().toISOString(),document_ids:[oid()]}));
  await expectData(call('get','/rehabilitations'));
  assert.ok(await Outbox.countDocuments({project_id:project._id})>=10);
});
test('rejection, resubmission and archive maintain history',async()=>{
  let p=await expectData(call('post','/projects','creator',{code:'TEST-02',name:'Second',ministry:'Test',state:'UP',district:'Prayagraj',acres:2,budgetCr:1}),201);
  await expectData(call('post','/parcels','creator',{project_id:p._id,surveyNumber:'2B',village:'Test',areaAcres:1,landType:'Homestead'}),201);
  p=await expectData(call('post',`/projects/${p._id}/submit`,'creator',{expected_version:p.__v}));
  p=await expectData(call('post',`/projects/${p._id}/reject`,'district',{expected_version:p.__v,remarks:'Need revision'}));
  p=await expectData(call('patch',`/projects/${p._id}`,'creator',{description:'Revised'}));
  p=await expectData(call('post',`/projects/${p._id}/submit`,'creator',{expected_version:p.__v}));
  p=await expectData(call('post',`/projects/${p._id}/reject`,'district',{expected_version:p.__v,remarks:'Not accepted'}));
  p=await expectData(call('post',`/projects/${p._id}/archive`,'creator',{expected_version:p.__v,remarks:'Withdrawn'}));
  assert.equal(p.status,'ARCHIVED');assert.equal((await call('patch',`/projects/${p._id}`,'creator',{name:'Changed'})).status,409);
});
test('unconfigured real integration adapters never return mock success',async()=>{
  delete process.env.PERSON_A_BASE_URL;delete process.env.PERSON_C_BASE_URL;
  await assert.rejects(integrations.verifyDocuments([oid()],project._id),{statusCode:503});
  await assert.rejects(integrations.verifyPossession(parcel._id,project._id),{statusCode:503});
});
