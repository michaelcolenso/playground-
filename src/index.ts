import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { initializeDatabase } from './database';
import authRoutes from './auth/routes';
import spaceRoutes from './spaces/routes';
import testimonialRoutes from './testimonials/routes';
import widgetRoutes from './widgets/routes';
import billingRoutes from './billing/routes';
import { renderLandingPage } from './pages/landing';
import { renderDocsPage } from './pages/docs';
import { renderRegisterPage, renderLoginPage } from './pages/auth';
import { renderDashboardPage } from './pages/dashboard';

export function createApp() {
  const app = express();

  // Stripe webhook needs raw body
  app.post('/api/billing/webhook', express.raw({ type: 'application/json' }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Rate limiting on API routes
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      message: { error: 'Too many requests. Please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Static files
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Pages
  app.get('/', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderLandingPage());
  });
  app.get('/docs', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderDocsPage());
  });
  app.get('/register', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderRegisterPage());
  });
  app.get('/login', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderLoginPage());
  });
  app.get('/dashboard', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderDashboardPage());
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/spaces', spaceRoutes);
  app.use('/api/testimonials', testimonialRoutes);
  app.use('/api/billing', billingRoutes);

  // Widget routes (public, no /api prefix)
  app.use('/widgets', widgetRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
  });

  // 404
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

if (require.main === module) {
  initializeDatabase();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   ✨ Praised is running!                      ║
  ║                                               ║
  ║   Home:    http://localhost:${String(config.port).padEnd(5)}              ║
  ║   Docs:    http://localhost:${String(config.port).padEnd(5)}/docs         ║
  ║   API:     http://localhost:${String(config.port).padEnd(5)}/api          ║
  ║   Widgets: http://localhost:${String(config.port).padEnd(5)}/widgets      ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
    `);
  });
}
