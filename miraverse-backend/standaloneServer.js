import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/apiRouter.js';
import { storageEngine } from './db/storageEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB Storage Engine (MongoDB Atlas with In-Memory Fallback)
storageEngine.initStorage();

// Mount all API routes under /api
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`🚀 MIRAVERSE Express Backend running on http://localhost:${PORT}`);
});