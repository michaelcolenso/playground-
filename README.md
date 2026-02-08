# Praised

Collect and showcase customer testimonials. Beautiful collection forms, one-line embeddable widgets, and a wall of love that converts visitors into customers.

## The Product

Praised is a complete testimonial SaaS:

1. **Create a Space** for your product (custom branding, questions, colors)
2. **Share the collection link** with customers — they fill out a gorgeous form
3. **Review & approve** testimonials in your dashboard
4. **Embed a widget** on your site with a single `<script>` tag

Every embed includes a "Powered by Praised" link — free viral marketing.

## Quick Start

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000`:
- `/` — Landing page
- `/docs` — API documentation
- `/api/testimonials/collect/:slug` — Public collection form
- `/widgets/wall/:slug` — Wall of love
- `/widgets/embed/:slug.js` — Embeddable JS widget

## Development

```bash
npm run dev    # watch mode
npm test       # 40 tests
npm run lint   # type check
```

## Docker

```bash
docker build -t praised .
docker run -p 3000:3000 praised
```

## API

Authenticate with `Authorization: Bearer <token>` or `X-API-Key: pr_...`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account, get JWT + API key |
| POST | `/api/auth/login` | Log in, get JWT |
| GET | `/api/auth/me` | Get profile |

### Spaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/spaces` | List spaces + testimonial counts |
| POST | `/api/spaces` | Create space (name, slug, brandColor) |
| GET | `/api/spaces/:id` | Get space |
| PUT | `/api/spaces/:id` | Update space |
| DELETE | `/api/spaces/:id` | Delete space + all testimonials |

### Testimonials
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/testimonials/space/:id` | List (filter with ?status=) |
| POST | `/api/testimonials` | Create via API (auto-approved) |
| PATCH | `/api/testimonials/:id` | Approve/reject/feature |
| DELETE | `/api/testimonials/:id` | Delete |

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/testimonials/collect/:slug` | Renders collection form |
| POST | `/api/testimonials/collect/:slug` | Submit testimonial (pending review) |
| GET | `/widgets/embed/:slug.js` | Embeddable JS widget |
| GET | `/widgets/wall/:slug` | Full-page wall of love |
| GET | `/widgets/api/:slug` | JSON API for approved testimonials |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing` | Plan info + usage |
| POST | `/api/billing/checkout` | Stripe checkout session |

## Embed Widget

Add testimonials to any website with one line:

```html
<script src="https://your-domain.com/widgets/embed/your-space.js"></script>
```

The widget renders a responsive masonry grid, adjusts columns to container width, and includes star ratings + author avatars.

## Environment Variables

```
PORT=3000
JWT_SECRET=change-me-in-production
DB_PATH=./data/praised.db
BASE_URL=https://your-domain.com

# Stripe (optional)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
```

## Architecture

- **Express + TypeScript** — type-safe API server
- **SQLite (better-sqlite3)** — zero-config, WAL mode
- **Server-rendered HTML** — landing page, forms, widgets, docs (no frontend build step)
- **JWT + API key** dual auth
- **Stripe** subscription billing with webhooks
- **Embeddable widget** — self-contained JS that creates its own DOM

## Pricing

| Plan | Price | Spaces | Testimonials | Key Features |
|------|-------|--------|-------------|-------------|
| Free | $0/mo | 1 | 15 | Widget, collection form, approval workflow |
| Pro | $19/mo | 10 | Unlimited | Remove branding, custom colors, API, priority support |
| Business | $49/mo | Unlimited | Unlimited | Video testimonials, custom CSS, webhooks, team members |
