import express from 'express';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/health.routes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api', healthRoutes);

export default app;
