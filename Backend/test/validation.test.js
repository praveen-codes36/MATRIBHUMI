import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import * as V from '../src/person-b/validation.js';
import {scope,checkJurisdiction} from '../src/person-b/access.js';
import {createPersonBRouter} from '../src/person-b/router.js';
import {verifyJWT} from '../src/middlewares/auth.middleware.js';
import {errorHandler} from '../src/person-b/errors.js';
import {integrations} from '../src/person-b/integrations.js';
import {models} from '../src/person-b/models.js';
const id='123456789012345678901234';
// MOCK_REPLACE: isolated validation fixtures, never used by production routes.
const project={code:'TEST',name:'Test project',ministry:'Test ministry',state:'UP',district:'Prayagraj',acres:10,budgetCr:1};
test('strict project validation blocks operator injection, status bypass and invalid numbers',()=>{
 assert.equal(V.project.parse(project).name,'Test project');
 for(const data of [{...project,status:'APPROVED'},{...project,acres:-1},{...project,budgetCr:NaN},{...project,name:{$ne:null}}])assert.equal(V.project.safeParse(data).success,false);
});
test('GeoJSON validates closure, numeric ranges and coordinate order',()=>{
 assert.equal(V.geometry.safeParse({type:'Polygon',coordinates:[[[80,25],[81,25],[81,26],[80,25]]]}).success,true);
 for(const coordinates of [[[[181,25],[81,25],[81,26],[181,25]]],[[[80,25],[81,25],[81,26],[80,26]]],[[[80,91],[81,25],[81,26],[80,91]]]])assert.equal(V.geometry.safeParse({type:'Polygon',coordinates}).success,false);
});
test('PII and family validation',()=>{
 const owner={project_id:id,parcel_id:id,name:'Demo owner',ownershipShare:100,aadhaarMasked:'XXXX-XXXX-1234'};
 assert.equal(V.owner.safeParse(owner).success,true);
 assert.equal(V.owner.safeParse({...owner,aadhaarMasked:'123456789012'}).success,false);
 assert.equal(V.owner.safeParse({...owner,ownershipShare:101}).success,false);
 assert.equal(V.family.safeParse({headOfFamily:'Example',familyMembersCount:0,scStStatus:'General',livelihoodLoss:'Agricultural'}).success,false);
});
test('jurisdiction fails closed for unassigned roles and missing scope',()=>{
 assert.throws(()=>scope({role:'member'}));assert.throws(()=>scope({role:'STATE_ADMIN'}));
 assert.throws(()=>checkJurisdiction({role:'DISTRICT_COLLECTOR',state:'MP',district:'Bhopal'},project));
 assert.throws(()=>checkJurisdiction({role:'FIELD_OFFICER',state:'UP',district:'Prayagraj',project_ids:[]},{...project,_id:id}));
 assert.doesNotThrow(()=>checkJurisdiction({role:'FIELD_OFFICER',state:'UP',district:'Prayagraj',project_ids:[id]},{...project,_id:id}));
});
test('pagination rejects operator injection and excessive page size',()=>{
 for(const q of [{limit:101},{project_id:{$ne:null}},{page:0},{unknown:'x'}]) assert.equal(V.listQuery.safeParse(q).success,false);
 assert.equal(V.listQuery.parse({}).limit,20);
});
test('patch validation preserves unspecified fields and rejects immutable IDs',()=>{
 const p=V.patchSchema(V.owner,['project_id','parcel_id']).parse({name:'Updated'});
 assert.deepEqual(p,{name:'Updated'});
 assert.equal(V.patchSchema(V.owner,['project_id','parcel_id']).safeParse({parcel_id:id}).success,false);
});
test('all 31 routes mount behind JWT and reject missing/invalid bearer tokens',async()=>{
 const router=createPersonBRouter({authenticate:verifyJWT});
 const routes=router.stack.filter(l=>l.route);
 assert.equal(routes.length,31);
 const app=express();app.use(express.json());app.use('/api/v1',router);app.use(errorHandler);
 for(const layer of routes){
  const method=Object.keys(layer.route.methods)[0],path='/api/v1'+layer.route.path.replace(':id',id);
  assert.equal((await request(app)[method](path)).status,401,`${method} ${path}`);
 }
 assert.equal((await request(app).get('/api/v1/projects').set('Authorization','Bearer not-a-jwt')).status,401);
});
test('real evidence adapters reject missing service configuration',async()=>{
 delete process.env.PERSON_A_BASE_URL;delete process.env.PERSON_C_BASE_URL;
 await assert.rejects(integrations.verifyDocuments([id],id),{statusCode:503});
 await assert.rejects(integrations.verifyPossession(id,id),{statusCode:503});
});
test('mongoose models and compound/unique/GIS indexes compile',()=>{
 assert.equal(models.length,7);
 assert.ok(models.find(m=>m.modelName==='BParcel').schema.indexes().some(([i])=>i.geometry==='2dsphere'));
 assert.ok(models.find(m=>m.modelName==='BPossession').schema.indexes().some(([i,o])=>i.parcel_id===1&&o.unique));
});
