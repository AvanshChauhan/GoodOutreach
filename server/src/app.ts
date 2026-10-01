import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { connectDatabase } from './config/database';
import { config } from './config';
import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import influencerRoutes from './routes/influencers';
import filterRoutes from './routes/filter';
import enrichmentRoutes from './routes/enrichment';
import personalizationRoutes from './routes/personalization';
import outreachRoutes from './routes/outreach';
import { getDashboardStats } from './controllers/dashboardController';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles & fonts in production bundle
  })
);
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      demoMode: config.isDemoMode,
      emailMode: config.emailMode,
    },
  });
});

// API routes
app.use('/api/influencers', influencerRoutes);
app.use('/api/filter', filterRoutes);
app.use('/api/enrichment', enrichmentRoutes);
app.use('/api/personalization', personalizationRoutes);
app.use('/api/outreach', outreachRoutes);
app.get('/api/dashboard/stats', getDashboardStats);

// Production single-server static frontend bundle serving
if (config.nodeEnv === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 404 + error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
async function start() {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`[Server] Running on port ${config.port} (${config.nodeEnv})`);
    console.log(`[Server] Demo mode: ${config.isDemoMode}`);
    console.log(`[Server] Email mode: ${config.emailMode}`);
  });
}

start().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

export default app;
