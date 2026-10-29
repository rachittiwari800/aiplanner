import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendSuccess } from './utils/apiResponse.js';

import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import visaRoutes from './routes/visaRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === env.FRONTEND_URL || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/visa', visaRoutes);


// Health check endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  return sendSuccess(res, {
    status: 'online',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
    service: 'AI Travel Planner 2.0 Backend',
  }, 'Service is healthy');
});


// Global Error Handler
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 AI Travel Planner Backend running on port ${PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('❌ Backend startup failed. Check DATABASE_URL and MongoDB.', error);
    process.exit(1);
  }
};

void startServer();

export default app;
