import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes/api';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Static files (landing page)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Landing page fallback
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │                                         │
  │   OpenGrab API v1.0                     │
  │   Favicon & Open Graph Image Service    │
  │                                         │
  │   http://localhost:${PORT}                │
  │                                         │
  │   Endpoints:                            │
  │   GET /api/v1/favicon?url=<url>         │
  │   GET /api/v1/og?url=<url>              │
  │   GET /api/v1/og/image?url=<url>        │
  │   GET /api/v1/meta?url=<url>            │
  │   GET /api/v1/generate?title=<title>    │
  │                                         │
  └─────────────────────────────────────────┘
  `);
});

export default app;
