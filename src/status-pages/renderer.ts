import { getDb } from '../database';
import { config } from '../config';

interface MonitorData {
  id: string;
  name: string;
  url: string;
  status: string;
  last_checked_at: string | null;
  last_response_time: number | null;
}

interface IncidentData {
  id: string;
  monitor_name: string;
  status: string;
  started_at: string;
  resolved_at: string | null;
  cause: string | null;
}

interface UptimeBar {
  date: string;
  uptime: number;
  total: number;
  up: number;
}

function getUptimeBars(monitorId: string, days: number = 30): UptimeBar[] {
  const db = getDb();
  const bars = db
    .prepare(
      `SELECT
        date(checked_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up
       FROM checks
       WHERE monitor_id = ? AND checked_at > datetime('now', ?)
       GROUP BY date(checked_at)
       ORDER BY date ASC`
    )
    .all(monitorId, `-${days} days`) as UptimeBar[];

  return bars.map((b) => ({
    ...b,
    uptime: b.total > 0 ? Math.round((b.up / b.total) * 10000) / 100 : 100,
  }));
}

export function renderStatusPage(page: Record<string, unknown>): string {
  const db = getDb();
  const monitorIds = JSON.parse(page.monitor_ids as string) as string[];
  const theme = (page.theme as string) || 'light';
  const isDark = theme === 'dark';

  const monitors: MonitorData[] =
    monitorIds.length > 0
      ? (db
          .prepare(
            `SELECT id, name, url, status, last_checked_at, last_response_time
             FROM monitors WHERE id IN (${monitorIds.map(() => '?').join(',')})`
          )
          .all(...monitorIds) as MonitorData[])
      : [];

  const incidents: IncidentData[] =
    monitorIds.length > 0
      ? (db
          .prepare(
            `SELECT i.id, m.name as monitor_name, i.status, i.started_at, i.resolved_at, i.cause
             FROM incidents i JOIN monitors m ON i.monitor_id = m.id
             WHERE i.monitor_id IN (${monitorIds.map(() => '?').join(',')})
             ORDER BY i.started_at DESC LIMIT 10`
          )
          .all(...monitorIds) as IncidentData[])
      : [];

  const allUp = monitors.every((m) => m.status === 'up');
  const anyDown = monitors.some((m) => m.status === 'down');

  const overallStatus = monitors.length === 0
    ? 'No monitors configured'
    : allUp
    ? 'All Systems Operational'
    : anyDown
    ? 'Partial System Outage'
    : 'Checking...';

  const statusColor = allUp ? '#10B981' : anyDown ? '#EF4444' : '#F59E0B';

  const bg = isDark ? '#0F172A' : '#F8FAFC';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const border = isDark ? '#334155' : '#E2E8F0';

  const monitorHtml = monitors
    .map((m) => {
      const bars = getUptimeBars(m.id, 30);
      const statusDot =
        m.status === 'up'
          ? '#10B981'
          : m.status === 'down'
          ? '#EF4444'
          : '#F59E0B';

      const barHtml = bars
        .map(
          (b) =>
            `<div title="${b.date}: ${b.uptime}% uptime" style="width:8px;height:28px;border-radius:2px;background:${
              b.uptime >= 99 ? '#10B981' : b.uptime >= 95 ? '#F59E0B' : '#EF4444'
            };opacity:0.8;"></div>`
        )
        .join('');

      return `
        <div style="background:${cardBg};border:1px solid ${border};border-radius:12px;padding:20px;margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:10px;height:10px;border-radius:50%;background:${statusDot};"></div>
              <span style="font-weight:600;color:${textPrimary};">${escapeHtml(m.name)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              ${m.last_response_time ? `<span style="color:${textSecondary};font-size:13px;">${m.last_response_time}ms</span>` : ''}
              <span style="font-size:13px;font-weight:500;color:${statusDot};text-transform:uppercase;">${m.status}</span>
            </div>
          </div>
          <div style="display:flex;gap:2px;align-items:end;">${barHtml}</div>
        </div>
      `;
    })
    .join('');

  const incidentHtml = incidents.length > 0
    ? incidents
        .map(
          (i) => `
          <div style="border-left:3px solid ${i.status === 'ongoing' ? '#EF4444' : '#10B981'};padding:8px 16px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="color:${textPrimary};">${escapeHtml(i.monitor_name)}</strong>
              <span style="font-size:12px;color:${textSecondary};">${i.started_at}</span>
            </div>
            ${i.cause ? `<p style="margin:4px 0 0;color:${textSecondary};font-size:13px;">${escapeHtml(i.cause)}</p>` : ''}
            ${i.resolved_at ? `<p style="margin:4px 0 0;color:#10B981;font-size:12px;">Resolved at ${i.resolved_at}</p>` : '<p style="margin:4px 0 0;color:#EF4444;font-size:12px;">Ongoing</p>'}
          </div>
        `
        )
        .join('')
    : `<p style="color:${textSecondary};text-align:center;padding:20px;">No recent incidents</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.name as string)} — Status</title>
  <meta name="description" content="Current status and uptime for ${escapeHtml(page.name as string)}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background: ${bg}; color: ${textPrimary}; }
  </style>
</head>
<body>
  <div style="max-width:720px;margin:0 auto;padding:40px 20px;">
    ${page.logo_url ? `<img src="${escapeHtml(page.logo_url as string)}" alt="" style="height:40px;margin-bottom:16px;">` : ''}
    <h1 style="font-size:24px;font-weight:700;margin-bottom:4px;">${escapeHtml(page.name as string)}</h1>
    ${page.description ? `<p style="color:${textSecondary};margin-bottom:24px;">${escapeHtml(page.description as string)}</p>` : '<div style="margin-bottom:24px;"></div>'}

    <div style="background:${cardBg};border:1px solid ${border};border-radius:12px;padding:20px;margin-bottom:32px;display:flex;align-items:center;gap:12px;">
      <div style="width:14px;height:14px;border-radius:50%;background:${statusColor};"></div>
      <span style="font-size:18px;font-weight:600;">${overallStatus}</span>
    </div>

    <h2 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${textSecondary};margin-bottom:12px;">Monitors</h2>
    ${monitorHtml || `<p style="color:${textSecondary};text-align:center;padding:20px;">No monitors configured yet.</p>`}

    <h2 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${textSecondary};margin:32px 0 12px;">Recent Incidents</h2>
    <div style="background:${cardBg};border:1px solid ${border};border-radius:12px;padding:16px;">
      ${incidentHtml}
    </div>

    <div style="margin-top:40px;text-align:center;">
      <a href="${config.baseUrl}" style="color:${textSecondary};font-size:12px;text-decoration:none;">Powered by <strong>PingBase</strong></a>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
