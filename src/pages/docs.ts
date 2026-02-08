import { config } from '../config';

export function renderDocsPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation — PingBase</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0B0F1A; color: #E2E8F0; line-height: 1.6;
    }
    .container { max-width: 860px; margin: 0 auto; padding: 40px 24px; }
    nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
    .logo { font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    h1 { font-size: 36px; font-weight: 800; margin-bottom: 8px; }
    .subtitle { color: #8892A8; font-size: 16px; margin-bottom: 40px; }
    h2 { font-size: 22px; font-weight: 700; margin: 40px 0 12px; padding-top: 20px; border-top: 1px solid #2A2F42; }
    h2:first-of-type { border-top: none; margin-top: 0; }
    h3 { font-size: 16px; font-weight: 600; margin: 24px 0 8px; color: #A78BFA; }
    p { color: #8892A8; margin-bottom: 12px; }
    code { background: #141929; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: 'SF Mono', monospace; }
    pre {
      background: #0D1117; border: 1px solid #2A2F42; border-radius: 8px;
      padding: 16px; overflow-x: auto; margin: 12px 0 20px;
      font-family: 'SF Mono', monospace; font-size: 13px; line-height: 1.7; color: #E2E8F0;
    }
    .method {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      font-size: 12px; font-weight: 700; margin-right: 8px;
    }
    .method-get { background: rgba(16, 185, 129, 0.15); color: #10B981; }
    .method-post { background: rgba(99, 102, 241, 0.15); color: #818CF8; }
    .method-put { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
    .method-delete { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
    .endpoint { font-family: 'SF Mono', monospace; font-size: 14px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #2A2F42; font-size: 13px; }
    th { color: #8892A8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    td code { background: none; padding: 0; }
    .note { background: rgba(99, 102, 241, 0.08); border-left: 3px solid #6366F1; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .note p { color: #C4B5FD; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <nav>
      <a href="/" class="logo" style="color:#E2E8F0;text-decoration:none;">📡 PingBase</a>
      <a href="/" style="color:#8892A8;font-size:14px;">Back to Home</a>
    </nav>

    <h1>API Documentation</h1>
    <p class="subtitle">Base URL: <code>${config.baseUrl}/api</code></p>

    <h2>Authentication</h2>
    <p>All API endpoints require authentication via either a JWT Bearer token or an API key.</p>
    <pre>// Using Bearer token
Authorization: Bearer &lt;your-jwt-token&gt;

// Using API key
X-API-Key: pb_your_api_key_here</pre>

    <h3><span class="method method-post">POST</span> <span class="endpoint">/auth/register</span></h3>
    <p>Create a new account.</p>
    <pre>{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}</pre>

    <h3><span class="method method-post">POST</span> <span class="endpoint">/auth/login</span></h3>
    <p>Log in and receive a JWT token.</p>
    <pre>{
  "email": "jane@example.com",
  "password": "securepassword123"
}</pre>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/auth/me</span></h3>
    <p>Get the current user's profile.</p>

    <h2>Monitors</h2>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/monitors</span></h3>
    <p>List all your monitors.</p>

    <h3><span class="method method-post">POST</span> <span class="endpoint">/monitors</span></h3>
    <p>Create a new monitor.</p>
    <table>
      <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
      <tr><td><code>name</code></td><td>string</td><td>Yes</td><td>Display name for the monitor</td></tr>
      <tr><td><code>url</code></td><td>string</td><td>Yes</td><td>URL to monitor (must be valid)</td></tr>
      <tr><td><code>method</code></td><td>string</td><td>No</td><td>HTTP method (default: GET)</td></tr>
      <tr><td><code>expectedStatus</code></td><td>number</td><td>No</td><td>Expected HTTP status (default: 200)</td></tr>
      <tr><td><code>checkInterval</code></td><td>number</td><td>No</td><td>Seconds between checks (30-3600)</td></tr>
      <tr><td><code>timeout</code></td><td>number</td><td>No</td><td>Request timeout in ms (default: 10000)</td></tr>
      <tr><td><code>headers</code></td><td>object</td><td>No</td><td>Custom headers to send</td></tr>
      <tr><td><code>body</code></td><td>string</td><td>No</td><td>Request body (for POST/PUT/PATCH)</td></tr>
    </table>
    <pre>// Example
{
  "name": "Production API",
  "url": "https://api.example.com/health",
  "checkInterval": 30,
  "headers": { "Authorization": "Bearer secret" }
}</pre>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/monitors/:id</span></h3>
    <p>Get a monitor with its recent checks and uptime stats.</p>

    <h3><span class="method method-put">PUT</span> <span class="endpoint">/monitors/:id</span></h3>
    <p>Update a monitor. All fields are optional.</p>

    <h3><span class="method method-delete">DELETE</span> <span class="endpoint">/monitors/:id</span></h3>
    <p>Delete a monitor and all its check history.</p>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/monitors/:id/stats</span></h3>
    <p>Get detailed uptime statistics. Query param: <code>?hours=24</code></p>

    <h2>Incidents</h2>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/incidents</span></h3>
    <p>List incidents across all monitors. Filter by <code>?status=ongoing</code> or <code>?status=resolved</code>.</p>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/incidents/:id</span></h3>
    <p>Get details for a specific incident.</p>

    <h2>Status Pages</h2>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/status-pages</span></h3>
    <p>List your status pages.</p>

    <h3><span class="method method-post">POST</span> <span class="endpoint">/status-pages</span></h3>
    <p>Create a new status page.</p>
    <pre>{
  "name": "Acme Corp Status",
  "slug": "acme-corp",
  "description": "Current system status for Acme Corp.",
  "monitorIds": ["monitor-uuid-1", "monitor-uuid-2"]
}</pre>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/status-pages/public/:slug</span></h3>
    <p>View a public status page. Returns HTML by default, or JSON with <code>Accept: application/json</code>.</p>

    <div class="note">
      <p>Public status pages are accessible without authentication and include the "Powered by PingBase" footer — free marketing for us, beautiful status pages for you.</p>
    </div>

    <h2>Alert Channels</h2>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/alerts</span></h3>
    <p>List your configured alert channels.</p>

    <h3><span class="method method-post">POST</span> <span class="endpoint">/alerts</span></h3>
    <p>Create a new alert channel.</p>
    <pre>// Email
{ "type": "email", "config": { "email": "ops@example.com" } }

// Webhook
{ "type": "webhook", "config": { "url": "https://example.com/hooks/ping" } }

// Slack
{ "type": "slack", "config": { "webhookUrl": "https://hooks.slack.com/services/..." } }</pre>

    <h3><span class="method method-delete">DELETE</span> <span class="endpoint">/alerts/:id</span></h3>
    <p>Delete an alert channel.</p>

    <h2>Billing</h2>

    <h3><span class="method method-get">GET</span> <span class="endpoint">/billing</span></h3>
    <p>Get current plan info, usage, and available plans.</p>

    <h3><span class="method method-post">POST</span> <span class="endpoint">/billing/checkout</span></h3>
    <p>Create a Stripe checkout session to upgrade your plan.</p>
    <pre>{ "plan": "pro" }  // or "business"</pre>
  </div>
</body>
</html>`;
}
