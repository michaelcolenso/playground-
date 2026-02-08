import { Router, Request, Response } from 'express';
import { config } from '../config';
import { getDb } from '../database';
import { authenticateToken, AuthRequest } from '../auth/middleware';

const router = Router();

// Get current billing info
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const user = db
    .prepare('SELECT plan, stripe_customer_id, stripe_subscription_id FROM users WHERE id = ?')
    .get(req.userId!) as { plan: string; stripe_customer_id: string | null; stripe_subscription_id: string | null };

  const monitorCount = db
    .prepare('SELECT COUNT(*) as count FROM monitors WHERE user_id = ?')
    .get(req.userId!) as { count: number };

  const limits: Record<string, number> = {
    free: config.freeTierMonitors,
    pro: config.proTierMonitors,
    business: config.businessTierMonitors,
  };

  res.json({
    plan: user.plan,
    monitorsUsed: monitorCount.count,
    monitorsLimit: limits[user.plan] || config.freeTierMonitors,
    hasStripeSubscription: !!user.stripe_subscription_id,
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        monitors: config.freeTierMonitors,
        features: ['3 monitors', '5-minute check interval', 'Email alerts', 'Public status page'],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 12,
        monitors: config.proTierMonitors,
        features: [
          '25 monitors',
          '30-second check interval',
          'Email, Slack & Webhook alerts',
          'Unlimited status pages',
          'Custom status page branding',
          '90-day data retention',
          'API access',
        ],
      },
      {
        id: 'business',
        name: 'Business',
        price: 49,
        monitors: config.businessTierMonitors,
        features: [
          '100 monitors',
          '30-second check interval',
          'All Pro features',
          'Custom domains for status pages',
          'Team members (coming soon)',
          '1-year data retention',
          'Priority support',
        ],
      },
    ],
  });
});

// Create checkout session
router.post('/checkout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { plan } = req.body;

  if (!config.stripeSecretKey) {
    res.status(503).json({ error: 'Billing is not configured. Set STRIPE_SECRET_KEY to enable.' });
    return;
  }

  if (plan !== 'pro' && plan !== 'business') {
    res.status(400).json({ error: 'Invalid plan. Choose "pro" or "business".' });
    return;
  }

  try {
    const stripe = require('stripe')(config.stripeSecretKey);
    const db = getDb();
    const user = db
      .prepare('SELECT email, stripe_customer_id FROM users WHERE id = ?')
      .get(req.userId!) as { email: string; stripe_customer_id: string | null };

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, req.userId!);
    }

    const priceId = plan === 'pro' ? config.stripePriceProMonthly : config.stripePriceBusinessMonthly;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${config.baseUrl}/dashboard?billing=success`,
      cancel_url: `${config.baseUrl}/dashboard?billing=cancelled`,
      metadata: { userId: req.userId!, plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[PingBase] Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
    res.status(503).json({ error: 'Billing is not configured' });
    return;
  }

  try {
    const stripe = require('stripe')(config.stripeSecretKey);
    const sig = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
    const db = getDb();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, plan } = session.metadata;
        db.prepare(
          "UPDATE users SET plan = ?, stripe_subscription_id = ?, updated_at = datetime('now') WHERE id = ?"
        ).run(plan, session.subscription, userId);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        db.prepare(
          "UPDATE users SET plan = 'free', stripe_subscription_id = NULL, updated_at = datetime('now') WHERE stripe_subscription_id = ?"
        ).run(subscription.id);
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[PingBase] Webhook error:', err);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

export default router;
