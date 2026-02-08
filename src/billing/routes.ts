import { Router, Request, Response } from 'express';
import { config } from '../config';
import { getDb } from '../database';
import { authenticateToken, AuthRequest } from '../auth/middleware';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const user = db
    .prepare('SELECT plan, stripe_customer_id, stripe_subscription_id FROM users WHERE id = ?')
    .get(req.userId!) as any;

  const spaceCount = db
    .prepare('SELECT COUNT(*) as count FROM spaces WHERE user_id = ?')
    .get(req.userId!) as { count: number };

  const testimonialCount = db
    .prepare(
      `SELECT COUNT(*) as count FROM testimonials t
       JOIN spaces s ON t.space_id = s.id WHERE s.user_id = ?`
    )
    .get(req.userId!) as { count: number };

  res.json({
    plan: user.plan,
    usage: {
      spaces: spaceCount.count,
      testimonials: testimonialCount.count,
    },
    limits: {
      free: { spaces: config.freeSpaces, testimonials: config.freeTestimonials },
      pro: { spaces: config.proSpaces, testimonials: 'unlimited' },
      business: { spaces: 'unlimited', testimonials: 'unlimited' },
    },
    plans: [
      {
        id: 'free', name: 'Free', price: 0,
        features: ['1 space', '15 testimonials', 'Embed widget', 'Collection form', 'Approval workflow'],
      },
      {
        id: 'pro', name: 'Pro', price: 19,
        features: ['10 spaces', 'Unlimited testimonials', 'All widget styles', 'Remove branding', 'Custom colors', 'API access', 'Priority support'],
      },
      {
        id: 'business', name: 'Business', price: 49,
        features: ['Unlimited spaces', 'Unlimited testimonials', 'All Pro features', 'Video testimonials', 'Custom CSS', 'Webhooks', 'Team members'],
      },
    ],
  });
});

router.post('/checkout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { plan } = req.body;

  if (!config.stripeSecretKey) {
    res.status(503).json({ error: 'Billing not configured. Set STRIPE_SECRET_KEY in env.' });
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
      .get(req.userId!) as any;

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
    console.error('[Praised] Stripe error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
    res.status(503).json({ error: 'Billing not configured' });
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
        db.prepare("UPDATE users SET plan = ?, stripe_subscription_id = ?, updated_at = datetime('now') WHERE id = ?")
          .run(plan, session.subscription, userId);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        db.prepare("UPDATE users SET plan = 'free', stripe_subscription_id = NULL, updated_at = datetime('now') WHERE stripe_subscription_id = ?")
          .run(sub.id);
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Praised] Webhook error:', err);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

export default router;
