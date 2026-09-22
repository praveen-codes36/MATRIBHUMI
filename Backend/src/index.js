import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './database/database.js';
import app from './app.js';
import { models } from './person-b/models.js';

await connectDB();
const topology = await mongoose.connection.db.admin().command({ hello: 1 });
if (!topology.setName && topology.msg !== 'isdbgrid') {
  throw new Error('Person B requires MongoDB Atlas or a replica set for transactions');
}
await Promise.all(models.map(model => model.init()));
const server = app.listen(process.env.PORT || 3000, () => console.log('MATRIBHUMI API listening'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(async () => { await mongoose.disconnect(); process.exit(0); });
});
