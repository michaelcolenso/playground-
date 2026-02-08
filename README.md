# PingBase

Uptime monitoring & beautiful status pages. Know the moment your services go down.

## What is PingBase?

PingBase is a complete SaaS application for monitoring website and API uptime. It includes:

- **HTTP monitoring** with configurable intervals (30s to 1hr)
- **Beautiful public status pages** with uptime history bars
- **Instant alerts** via email, Slack, and webhooks
- **Incident tracking** with automatic detection and resolution
- **REST API** for programmatic access to everything
- **Stripe billing** with Free / Pro ($12/mo) / Business ($49/mo) tiers

## Quick Start

```bash
npm install
npm run build
npm start
```

Server runs at `http://localhost:3000` with:
- Landing page at `/`
- API docs at `/docs`
- API at `/api/*`

## Development

```bash
npm run dev    # watch mode with hot reload
npm test       # run 32 tests
npm run lint   # type check
```

## Docker

```bash
docker build -t pingbase .
docker run -p 3000:3000 pingbase
```

## API Overview

All authenticated endpoints accept either:
- `Authorization: Bearer <jwt-token>` header
- `X-API-Key: pb_your_key` header

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, get JWT |
| GET | `/api/auth/me` | Get profile |

### Monitors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/monitors` | List monitors |
| POST | `/api/monitors` | Create monitor |
| GET | `/api/monitors/:id` | Get monitor + checks + uptime |
| PUT | `/api/monitors/:id` | Update monitor |
| DELETE | `/api/monitors/:id` | Delete monitor |
| GET | `/api/monitors/:id/stats` | Uptime statistics |

### Status Pages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status-pages` | List your status pages |
| POST | `/api/status-pages` | Create status page |
| GET | `/api/status-pages/public/:slug` | View public status page (HTML or JSON) |
| PUT | `/api/status-pages/:id` | Update status page |
| DELETE | `/api/status-pages/:id` | Delete status page |

### Incidents & Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | List incidents |
| GET | `/api/alerts` | List alert channels |
| POST | `/api/alerts` | Create alert channel |
| DELETE | `/api/alerts/:id` | Delete alert channel |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing` | Get plan info + usage |
| POST | `/api/billing/checkout` | Create Stripe checkout session |

## Environment Variables

```
PORT=3000
JWT_SECRET=your-secret-here
DB_PATH=./data/pingbase.db
BASE_URL=https://your-domain.com

# Stripe (optional — billing works without it)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...

# Email alerts (optional — logs to console without it)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_...
EMAIL_FROM=alerts@pingbase.io
```

## Architecture

- **Express + TypeScript** — Fast, type-safe API server
- **SQLite (better-sqlite3)** — Zero-config database, WAL mode for performance
- **Background monitoring engine** — Runs checks concurrently in batches of 10
- **Server-rendered HTML** — Landing page, docs, and status pages with no frontend build step
- **JWT + API key auth** — Dual authentication for web and programmatic access
- **Stripe integration** — Subscription billing with webhook handling

## Pricing Model

| Plan | Price | Monitors | Interval | Features |
|------|-------|----------|----------|----------|
| Free | $0/mo | 3 | 5 min | Email alerts, 1 status page |
| Pro | $12/mo | 25 | 30 sec | Slack/webhook alerts, unlimited status pages, API |
| Business | $49/mo | 100 | 30 sec | Custom domains, team members, priority support |
