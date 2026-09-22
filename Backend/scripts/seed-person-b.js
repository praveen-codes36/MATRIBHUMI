import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/users.models.js';
import { Project,Parcel,Owner,models } from '../src/person-b/models.js';
// MOCK_REPLACE: opt-in fictional demo accounts and records. No real people or land records.
// Not called by npm start. Never run against a shared/production database.
if(process.env.NODE_ENV!=='development'||process.env.ALLOW_DEMO_SEED!=='true') throw new Error('Set NODE_ENV=development and ALLOW_DEMO_SEED=true for a dedicated demo DB');
if(!process.env.DEMO_PASSWORD||process.env.DEMO_PASSWORD.length<12) throw new Error('Set a unique DEMO_PASSWORD of at least 12 characters');
await mongoose.connect(process.env.MONGO_URI);
try {
  await Promise.all([...models,User].map(m=>m.init()));
  await mongoose.connection.transaction(async session=>{
    if(await Project.exists({code:'DEMO-B-001'}).session(session)) throw new Error('Demo already seeded; no records were changed');
    const accounts={};
    for(const [name,role] of [['creator','DISTRICT_COLLECTOR'],['district','DISTRICT_COLLECTOR'],['state','STATE_ADMIN'],['central','CENTRAL_ADMIN'],['field','FIELD_OFFICER']]) {
      const [u]=await User.create([{username:`demo_b_${name}`,email:`demo_b_${name}@example.test`,password:process.env.DEMO_PASSWORD,isEmailVerified:true,role,state:'Uttar Pradesh',district:'Prayagraj'}],{session});accounts[name]=u;
    }
    const [p]=await Project.create([{code:'DEMO-B-001',name:'Demo connector road',ministry:'Demo Ministry',state:'Uttar Pradesh',district:'Prayagraj',acres:10,budgetCr:2,created_by:accounts.creator._id}],{session});
    const [parcel]=await Parcel.create([{project_id:p._id,surveyNumber:'DEMO-1A',village:'Demo Village',areaAcres:2,landType:'Dry Agricultural',geometry:{type:'Polygon',coordinates:[[[81.8,25.4],[81.81,25.4],[81.81,25.41],[81.8,25.4]]]}}],{session});
    await Owner.create([{project_id:p._id,parcel_id:parcel._id,name:'Demo Owner',ownershipShare:100,families:[{headOfFamily:'Demo Family',familyMembersCount:3,scStStatus:'General',livelihoodLoss:'Agricultural'}]}],{session});
    accounts.field.project_ids=[p._id];await accounts.field.save({session});
  });
  console.log('Seed complete: DEMO-B-001. Login as demo_b_creator@example.test with your DEMO_PASSWORD. Approver accounts: demo_b_district/state/central@example.test.');
} finally { await mongoose.disconnect(); }
