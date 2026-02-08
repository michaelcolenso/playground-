export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'pingbase-dev-secret-change-in-production',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH || './data/pingbase.db',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  // Monitoring defaults
  defaultCheckInterval: 60, // seconds
  minCheckInterval: 30,
  maxCheckInterval: 3600,
  requestTimeout: 10000, // ms

  // Free tier limits
  freeTierMonitors: 3,
  proTierMonitors: 25,
  businessTierMonitors: 100,

  // Stripe (set in env for production)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePriceProMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  stripePriceBusinessMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',

  // Email (set in env for production)
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'alerts@pingbase.io',
};
