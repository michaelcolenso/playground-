import nodemailer from 'nodemailer';
import { config } from '../config';
import { getDb } from '../database';

interface AlertData {
  type: 'down' | 'up';
  monitorName: string;
  monitorUrl: string;
  error?: string;
}

interface AlertChannel {
  id: string;
  type: string;
  config: string;
  is_active: number;
}

function createTransporter() {
  if (!config.smtpHost) return null;
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[PingBase] Email alert (no SMTP configured): ${subject} -> ${to}`);
    return;
  }

  await transporter.sendMail({
    from: config.emailFrom,
    to,
    subject,
    html,
  });
}

async function sendWebhookAlert(url: string, data: AlertData): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: data.type === 'down' ? 'monitor.down' : 'monitor.up',
        monitor: { name: data.monitorName, url: data.monitorUrl },
        error: data.error,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error(`[PingBase] Webhook alert failed:`, err);
  }
}

export async function sendAlert(userId: string, data: AlertData): Promise<void> {
  const db = getDb();

  // Get user email for default alerts
  const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(userId) as
    | { email: string; name: string }
    | undefined;

  // Get configured alert channels
  const channels = db
    .prepare('SELECT * FROM alert_channels WHERE user_id = ? AND is_active = 1')
    .all(userId) as AlertChannel[];

  const isDown = data.type === 'down';
  const statusEmoji = isDown ? '🔴' : '✅';
  const subject = isDown
    ? `${statusEmoji} DOWN: ${data.monitorName} is not responding`
    : `${statusEmoji} UP: ${data.monitorName} is back online`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${isDown ? '#FEE2E2' : '#D1FAE5'}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: ${isDown ? '#991B1B' : '#065F46'};">${subject}</h2>
      </div>
      <p><strong>Monitor:</strong> ${data.monitorName}</p>
      <p><strong>URL:</strong> ${data.monitorUrl}</p>
      ${data.error ? `<p><strong>Error:</strong> ${data.error}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
      <p style="color: #6B7280; font-size: 12px;">Sent by PingBase — Uptime Monitoring & Status Pages</p>
    </div>
  `;

  // Always send to user email
  if (user) {
    await sendEmail(user.email, subject, html);
  }

  // Send to configured channels
  for (const channel of channels) {
    try {
      const channelConfig = JSON.parse(channel.config);
      switch (channel.type) {
        case 'email':
          await sendEmail(channelConfig.email, subject, html);
          break;
        case 'webhook':
          await sendWebhookAlert(channelConfig.url, data);
          break;
        case 'slack':
          await sendWebhookAlert(channelConfig.webhookUrl, data);
          break;
      }
    } catch (err) {
      console.error(`[PingBase] Alert channel ${channel.type} failed:`, err);
    }
  }
}
