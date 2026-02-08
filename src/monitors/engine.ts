import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database';
import { sendAlert } from '../notifications/alerts';

interface MonitorRow {
  id: string;
  user_id: string;
  name: string;
  url: string;
  method: string;
  expected_status: number;
  check_interval: number;
  timeout: number;
  headers: string;
  body: string | null;
  status: string;
}

interface CheckResult {
  status: 'up' | 'down';
  responseTime: number;
  statusCode: number | null;
  error: string | null;
}

async function performCheck(monitor: MonitorRow): Promise<CheckResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), monitor.timeout);

  try {
    let headers: Record<string, string> = {};
    try {
      headers = JSON.parse(monitor.headers);
    } catch {
      // ignore parse errors
    }

    const fetchOptions: RequestInit = {
      method: monitor.method,
      headers,
      signal: controller.signal,
      redirect: 'follow',
    };

    if (monitor.body && ['POST', 'PUT', 'PATCH'].includes(monitor.method)) {
      fetchOptions.body = monitor.body;
    }

    const response = await fetch(monitor.url, fetchOptions);
    const responseTime = Date.now() - startTime;

    const isUp = response.status === monitor.expected_status;

    return {
      status: isUp ? 'up' : 'down',
      responseTime,
      statusCode: response.status,
      error: isUp ? null : `Expected status ${monitor.expected_status}, got ${response.status}`,
    };
  } catch (err) {
    const responseTime = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return {
      status: 'down',
      responseTime,
      statusCode: null,
      error: errorMessage.includes('abort') ? 'Request timeout' : errorMessage,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function recordCheck(monitorId: string, result: CheckResult): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO checks (monitor_id, status, response_time, status_code, error)
     VALUES (?, ?, ?, ?, ?)`
  ).run(monitorId, result.status, result.responseTime, result.statusCode, result.error);

  db.prepare(
    `UPDATE monitors SET status = ?, last_checked_at = datetime('now'),
     last_response_time = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(result.status, result.responseTime, monitorId);
}

function handleIncidents(monitor: MonitorRow, result: CheckResult): void {
  const db = getDb();

  if (result.status === 'down' && monitor.status !== 'down') {
    // New incident — service just went down
    const incidentId = uuidv4();
    db.prepare(
      `INSERT INTO incidents (id, monitor_id, status, cause) VALUES (?, ?, 'ongoing', ?)`
    ).run(incidentId, monitor.id, result.error);

    sendAlert(monitor.user_id, {
      type: 'down',
      monitorName: monitor.name,
      monitorUrl: monitor.url,
      error: result.error || 'Service is down',
    });
  } else if (result.status === 'up' && monitor.status === 'down') {
    // Incident resolved — service came back up
    db.prepare(
      `UPDATE incidents SET status = 'resolved', resolved_at = datetime('now')
       WHERE monitor_id = ? AND status = 'ongoing'`
    ).run(monitor.id);

    sendAlert(monitor.user_id, {
      type: 'up',
      monitorName: monitor.name,
      monitorUrl: monitor.url,
    });
  }
}

async function checkMonitor(monitor: MonitorRow): Promise<void> {
  const result = await performCheck(monitor);
  recordCheck(monitor.id, result);
  handleIncidents(monitor, result);
}

// Track last check times to implement per-monitor intervals
const lastCheckTimes = new Map<string, number>();

export async function runMonitoringCycle(): Promise<void> {
  const db = getDb();
  const monitors = db
    .prepare('SELECT * FROM monitors WHERE is_active = 1')
    .all() as MonitorRow[];

  const now = Date.now();
  const checksToRun: MonitorRow[] = [];

  for (const monitor of monitors) {
    const lastCheck = lastCheckTimes.get(monitor.id) || 0;
    if (now - lastCheck >= monitor.check_interval * 1000) {
      checksToRun.push(monitor);
      lastCheckTimes.set(monitor.id, now);
    }
  }

  // Run checks concurrently in batches of 10
  const batchSize = 10;
  for (let i = 0; i < checksToRun.length; i += batchSize) {
    const batch = checksToRun.slice(i, i + batchSize);
    await Promise.allSettled(batch.map((m) => checkMonitor(m)));
  }
}

let monitoringInterval: ReturnType<typeof setInterval> | null = null;

export function startMonitoring(): void {
  if (monitoringInterval) return;

  console.log('[PingBase] Monitoring engine started');

  // Run every 10 seconds; the cycle logic handles per-monitor intervals
  monitoringInterval = setInterval(() => {
    runMonitoringCycle().catch((err) => {
      console.error('[PingBase] Monitoring cycle error:', err);
    });
  }, 10_000);

  // Run first cycle immediately
  runMonitoringCycle().catch((err) => {
    console.error('[PingBase] Initial monitoring cycle error:', err);
  });
}

export function stopMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('[PingBase] Monitoring engine stopped');
  }
}
