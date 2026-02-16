export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'praised-dev-secret-change-in-production',
  dbPath: process.env.DB_PATH || './data/praised.db',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  // Plan limits
  freeSpaces: 1,
  freeTestimonials: 7,
  proSpaces: 5,
  proTestimonials: -1, // unlimited
  businessSpaces: -1,
  businessTestimonials: -1,

  // Plan prices (dollars)
  proPriceMonthly: 39,
  proPriceAnnual: 29, // per month, billed annually
  businessPriceMonthly: 99,
  businessPriceAnnual: 79, // per month, billed annually

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePriceProMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  stripePriceProAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
  stripePriceBusinessMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
  stripePriceBusinessAnnual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL || '',
};
