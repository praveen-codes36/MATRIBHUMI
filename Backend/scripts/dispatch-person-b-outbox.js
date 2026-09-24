import 'dotenv/config';
import mongoose from 'mongoose';
import { Outbox } from '../src/person-b/models.js';
// INTEGRATION_TODO [A]: agree this POST contract with Person A. Delivery is at-least-once;
// the consumer MUST deduplicate by event_id. No fake acknowledgement or silent drop.
if(!process.env.PERSON_A_BASE_URL||!process.env.INTEGRATION_SERVICE_TOKEN) throw new Error('Configure Person A URL and integration service token');
await mongoose.connect(process.env.MONGO_URI);
let failed=0,delivered=0;
try {
  const batch=await Outbox.find({deliveredAt:null}).sort({createdAt:1}).limit(100).lean();
  for(const event of batch) {
    try {
      const response=await fetch(new URL('api/v1/integration-events',process.env.PERSON_A_BASE_URL),{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.INTEGRATION_SERVICE_TOKEN}`},
        body:JSON.stringify({event_id:String(event._id),source:'person-b',project_id:String(event.project_id),aggregate_id:String(event.aggregate_id),actor_id:String(event.actor_id),event:event.event,payload:event.payload,occurred_at:event.createdAt}),signal:AbortSignal.timeout(5000)
      });
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const ack=await response.json();
      if(ack?.data?.accepted!==true||ack.data.event_id!==String(event._id)) throw new Error('Missing matching acknowledgement');
      await Outbox.updateOne({_id:event._id,deliveredAt:null},{$set:{deliveredAt:new Date()}});delivered++;
    } catch {failed++;} // Keep failed rows pending for the next run; do not log PII/tokens.
  }
  console.log(JSON.stringify({delivered,failed}));if(failed)process.exitCode=1;
} finally {await mongoose.disconnect();}
