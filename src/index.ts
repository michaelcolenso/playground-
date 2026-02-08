import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { initializeDatabase } from './database';
import { startMonitoring, stopMonitoring } from './monitors/engine';
import authRoutes from './auth/routes';
import monitorRoutes from './monitors/routes';
import incidentRoutes from './incidents/routes';
import statusPageRoutes from './status-pages/routes';
import alertRoutes from './notifications/routes';
import billingRoutes from './billing/routes';
import { renderLandingPage } from './pages/landing';
import { renderDocsPage } from './pages/docs';

export function createApp() {
  const app = express();

  // Stripe webhook needs raw body
  app.post('/api/billing/webhook', express.raw({ type: 'application/json' }));

  // Standard middleware
  app.use(express.json());
  app.use(cors());

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  // Static files
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Landing page
  app.get('/', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderLandingPage());
  });

  // Docs page
  app.get('/docs', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderDocsPage());
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/monitors', monitorRoutes);
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/status-pages', statusPageRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/billing', billingRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

// Start server if run directly
if (require.main === module) {
  initializeDatabase();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   📡 PingBase is running!                    ║
  ║                                              ║
  ║   Local:  http://localhost:${String(config.port).padEnd(5)}             ║
  ║   Docs:   http://localhost:${String(config.port).padEnd(5)}/docs        ║
  ║   API:    http://localhost:${String(config.port).padEnd(5)}/api         ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
    `);

    startMonitoring();
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[PingBase] Shutting down...');
    stopMonitoring();
    server.close(() => {
      console.log('[PingBase] Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
