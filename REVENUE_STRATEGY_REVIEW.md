# Praised — Revenue Strategy Review

Critical analysis of the current product, pricing, and growth strategy with concrete recommendations to maximize revenue.

---

## Executive Summary

Praised is a well-scoped testimonial SaaS with clean architecture, but it's leaving significant money on the table. The core problems:

1. **No frontend** — the product is API-only with no dashboard UI, making it unusable for the target market
2. **Broken conversion funnel** — every CTA on the landing page links to a JSON API endpoint
3. **Underpriced by 2-3x** relative to competitors
4. **Advertised features don't exist** — Video testimonials, team members, webhooks, and custom CSS are listed on the pricing page but not implemented
5. **Zero analytics** — no way to measure what's working or what's not
6. **No upgrade nudges** — users hit limits and get a raw 403 JSON error with no path to upgrade

The product has the right idea. The execution needs focused work in the areas that directly drive revenue.

---

## 1. CRITICAL: The Product Is Not Shippable

### 1a. No Dashboard / Frontend

The entire user experience after registration is a JSON API. There is no:
- Dashboard to manage spaces
- UI to approve/reject testimonials
- Settings page to manage billing
- Onboarding flow for new users

**Impact:** This is a dealbreaker. The target audience (marketers, founders, freelancers) will not use curl commands or Postman. Without a frontend, there are zero paying customers.

**Recommendation:** Build a minimal dashboard with:
- Space list + creation form
- Testimonial inbox with approve/reject buttons
- Embed code copy-paste section
- Usage meter showing proximity to limits (this drives upgrades)
- Billing/plan management page

### 1b. Landing Page CTAs Are Broken

Every CTA button (`/api/auth/register`) hits a JSON API endpoint. A visitor clicking "Start Collecting — Free" sees:

```json
{"error": "Email, password, and name are required"}
```

**Impact:** 100% bounce rate on every conversion action. No one can sign up through the website.

**Recommendation:** Build actual registration/login pages with HTML forms that post to the API and redirect to the dashboard.

### 1c. Advertised Features Don't Exist

The pricing page promises these Business-tier features that have no implementation:
- **Video testimonials** — no upload, storage, or playback code
- **Team members** — no invitation system, no roles, no multi-user support
- **Webhook integrations** — no webhook dispatch system
- **Custom CSS** — no CSS injection in widgets

Selling features that don't exist is a churn and trust problem. Either build them or remove them from the pricing page until they're ready.

---

## 2. Pricing Strategy: Underpriced and Poorly Structured

### Current Pricing

| Plan | Price | Key Limits |
|------|-------|-----------|
| Free | $0/mo | 1 space, 15 testimonials |
| Pro | $19/mo | 10 spaces, unlimited testimonials |
| Business | $49/mo | Unlimited everything |

### Problems

**A. Underpriced relative to market.** Direct competitors:
- Testimonial.to: $50/mo (starter) to $150/mo (premium)
- Senja: $49/mo to $199/mo
- Shoutout: $25/mo to $99/mo

At $19/mo for Pro, Praised is positioning itself as the cheapest option in a market where cheap signals "not serious." B2B buyers choosing a testimonial tool are already spending thousands on marketing — $19/mo is a rounding error that paradoxically makes them less likely to trust the product.

**B. No annual pricing.** Annual plans (typically 20% discount vs monthly) are the single highest-leverage pricing change you can make:
- Reduces churn by locking in commitment
- Improves cash flow with upfront payment
- Increases LTV by ~40% on average

**C. Free tier is too generous.** 15 testimonials is enough for most small businesses forever. The upgrade trigger should come sooner.

**D. The jump from Pro ($19) to Business ($49) is 2.6x.** The value gap doesn't justify it because the Business features (video, teams, webhooks) don't exist yet.

### Recommended Pricing

| Plan | Monthly | Annual (per month) | Key Limits |
|------|---------|-------------------|-----------|
| Free | $0 | — | 1 space, 7 testimonials, Praised branding |
| Pro | $39/mo | $29/mo | 5 spaces, unlimited testimonials, no branding, custom colors |
| Business | $99/mo | $79/mo | Unlimited spaces, video, custom CSS, webhooks, team seats |
| Enterprise | Custom | Custom | SSO, SLA, dedicated support, custom integrations |

Key changes:
- **Free tier reduced to 7 testimonials** — enough to see value, not enough to avoid upgrading
- **Pro doubled to $39/mo** — still cheaper than competitors, but signals real product
- **Business at $99/mo** — competitive with market, justified when features actually exist
- **Annual pricing added** — 25% discount incentivizes annual commitment
- **Enterprise tier** — captures large accounts that would otherwise choose a competitor

### Implementation Notes

Annual pricing requires adding `STRIPE_PRICE_PRO_ANNUAL` and `STRIPE_PRICE_BUSINESS_ANNUAL` environment variables and updating the checkout endpoint to accept a `billing_period` parameter. The Stripe integration is already solid — this is a small change.

---

## 3. Conversion Funnel: Money Left on the Table

### Current Funnel

```
Landing Page → (broken CTA) → JSON Error → User Leaves
```

Even if the CTA worked:

```
Landing Page → Register → JSON Response → ??? → No Dashboard → User Leaves
```

### What the Funnel Should Be

```
Landing Page → Register Page → Onboarding (create first space) →
Dashboard (with usage meter) → Hit limit → Upgrade prompt with
one-click checkout → Stripe → Paid customer
```

### Specific Fixes

**A. In-app upgrade prompts.** When a free user approaches their limit (e.g., 5/7 testimonials), show a banner:

> "You've used 5 of 7 testimonials. Upgrade to Pro for unlimited testimonials — $39/mo"

The current behavior (`src/testimonials/routes.ts:176-179`) returns a raw 403 with no upgrade path:
```json
{"error": "This space has reached its testimonial limit."}
```

This is the moment of highest purchase intent and the product throws it away.

**B. The "Powered by Praised" badge is an underutilized growth loop.** Currently (`src/widgets/routes.ts:162-165`), the badge links to the homepage. It should link to a dedicated landing page optimized for the context: "See how [Company] uses Praised to collect testimonials. Start free."

Track badge clicks per space so users can see their referral impact. This also makes the badge removal (Pro feature) more tangible — "Your widget was seen X times this month with Praised branding."

**C. No email capture or nurture.** There's no:
- Welcome email after registration
- Email when a new testimonial is submitted
- Weekly digest of testimonial activity
- Upgrade reminder emails when approaching limits
- Win-back emails for churned users

Email is the highest-ROI channel for SaaS conversion. At minimum, send a notification when testimonials come in — it re-engages users and reminds them the product is working.

---

## 4. Missing Revenue Multipliers

### 4a. Social Import (High Impact)

Users' best testimonials already exist on Twitter/X, G2, Product Hunt, Google Reviews, and LinkedIn. An "Import from..." feature would:
- Dramatically reduce time-to-value (no waiting for customers to fill out forms)
- Justify a higher price point
- Create a competitive moat

### 4b. Integrations (Medium Impact)

- **Slack/Discord notifications** — notify team when testimonials come in
- **Zapier/Make** — connect to existing marketing workflows
- **CRM integration** — auto-tag customers who give testimonials

These justify the Business tier price.

### 4c. Analytics Dashboard (Medium Impact)

- Widget impressions and click-through rates
- Conversion lift measurement (before/after embedding testimonials)
- Best-performing testimonials

This data makes the product stickier and justifies ongoing payment.

### 4d. Multiple Widget Formats (Medium Impact)

Currently only a masonry wall. Add:
- Carousel/slider
- Single rotating testimonial
- Badge/counter ("Rated 4.9/5 by 200+ customers")
- Inline quote blocks

More formats = more embed locations = more value = easier to justify paid plan.

---

## 5. Technical Issues Impacting Revenue

### 5a. SQLite Will Not Scale

SQLite with WAL mode handles reads well but serializes all writes. With concurrent users creating testimonials through collection forms, write contention will cause failures under load. A single busy widget page generating form submissions can lock out other operations.

**Recommendation:** Plan migration to PostgreSQL before scaling marketing. This doesn't need to happen today, but it should happen before any real traffic push.

### 5b. Widget Performance

The embed widget (`/widgets/embed/:slug.js`) queries the database and renders HTML on every request with only a 60-second cache. At scale, this means every page load on every customer's website hits the Praised database.

**Recommendation:**
- Increase `Cache-Control` to 5-10 minutes
- Add `stale-while-revalidate` for instant responses
- Pre-generate widget HTML on testimonial approval, serve from cache/CDN

### 5c. No Stripe `customer.subscription.updated` Handler

The webhook handler (`src/billing/routes.ts:110-124`) only handles `checkout.session.completed` and `customer.subscription.deleted`. It doesn't handle:
- `customer.subscription.updated` — plan changes, payment failures
- `invoice.payment_failed` — failed renewals

This means if a customer's card expires, they keep their paid plan forever. Revenue leakage.

---

## 6. Quick Wins (Sorted by Revenue Impact)

These are changes that can be made with relatively small code changes:

### Tier 1: Fix What's Broken
1. **Build registration/login HTML pages** — without this, zero conversions from the landing page
2. **Build a minimal dashboard** — without this, the product is unusable
3. **Remove unimplemented features from pricing page** — video, teams, webhooks, custom CSS
4. **Add `customer.subscription.updated` and `invoice.payment_failed` webhook handlers** — plug revenue leak

### Tier 2: Increase Conversion Rate
5. **Add annual pricing with 25% discount** — highest-leverage pricing change
6. **Reduce free tier to 7 testimonials** — accelerate upgrade trigger
7. **Raise prices** — Pro to $39/mo, Business to $99/mo
8. **Add upgrade prompts at limit boundaries** — capture purchase intent
9. **Send email notifications on new testimonials** — re-engage users

### Tier 3: Increase Revenue Per Customer
10. **Add more widget formats** (carousel, badge, inline) — more embed points = more value
11. **Build social import** (Twitter, G2, Google Reviews) — faster time-to-value
12. **Add widget analytics** (impressions, clicks) — justify ongoing payment
13. **Build the advertised features** (video, teams, webhooks) — earn the Business tier price

---

## 7. Competitive Positioning

Praised occupies the "simple and affordable" position, which is viable but requires careful execution. The risk is being perceived as a toy.

**Current positioning:** "Simple testimonial collection" — competes on ease of use
**Better positioning:** "Testimonials that convert" — competes on outcome

The landing page already hints at this ("Watch your conversion rate climb") but doesn't back it up with data or analytics features. If Praised can show users their conversion lift from embedding testimonials, that's a story worth $99/mo.

---

## Summary

The product's core loop — collect, approve, embed — is sound. The code is clean and well-structured. But the revenue strategy has fundamental gaps:

1. **No usable frontend** = no customers
2. **Broken CTAs** = no sign-ups
3. **Underpriced** = leaving 2-3x revenue on the table
4. **No upgrade nudges** = free users stay free
5. **Phantom features** = trust erosion at upgrade decision point
6. **No billing webhook coverage** = paying users get free rides on failed payments
7. **No analytics** = flying blind on what to optimize

Fix items 1-2 first (they're blockers). Then 3-6 in parallel. Then build toward the features that justify premium pricing.
