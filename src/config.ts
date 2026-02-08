export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'praised-dev-secret-change-in-production',
  dbPath: process.env.DB_PATH || './data/praised.db',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  // Plan limits
  freeSpaces: 1,
  freeTestimonials: 15,
  proSpaces: 10,
  proTestimonials: -1, // unlimited
  businessSpaces: -1,
  businessTestimonials: -1,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePriceProMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  stripePriceBusinessMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
};
