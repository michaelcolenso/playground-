import { config } from '../config';

export function renderLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PingBase — Uptime Monitoring & Beautiful Status Pages</title>
  <meta name="description" content="Know the moment your services go down. Simple, reliable uptime monitoring with beautiful status pages your customers will love.">
  <meta property="og:title" content="PingBase — Uptime Monitoring & Status Pages">
  <meta property="og:description" content="Simple, reliable uptime monitoring with beautiful status pages.">
  <meta property="og:type" content="website">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📡</text></svg>">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #0B0F1A;
      --surface: #141929;
      --surface-hover: #1C2236;
      --border: #2A2F42;
      --text: #E2E8F0;
      --text-muted: #8892A8;
      --accent: #6366F1;
      --accent-hover: #818CF8;
      --green: #10B981;
      --red: #EF4444;
      --yellow: #F59E0B;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { color: var(--accent-hover); }

    /* Navigation */
    nav {
      display: flex; justify-content: space-between; align-items: center;
      max-width: 1100px; margin: 0 auto; padding: 20px 24px;
    }
    .logo { font-size: 20px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
    .logo-icon { font-size: 24px; }
    .nav-links { display: flex; gap: 24px; align-items: center; }
    .nav-links a { color: var(--text-muted); font-size: 14px; font-weight: 500; }
    .nav-links a:hover { color: var(--text); }
    .btn {
      display: inline-flex; align-items: center; padding: 10px 20px; border-radius: 8px;
      font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: all 0.15s;
    }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
    .btn-outline { border: 1px solid var(--border); background: transparent; color: var(--text); }
    .btn-outline:hover { border-color: var(--accent); background: var(--surface); }

    /* Hero */
    .hero {
      text-align: center; max-width: 800px; margin: 0 auto;
      padding: 80px 24px 60px;
    }
    .hero-badge {
      display: inline-block; padding: 6px 16px; border-radius: 100px;
      background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2);
      color: var(--accent-hover); font-size: 13px; font-weight: 500; margin-bottom: 24px;
    }
    .hero h1 { font-size: 52px; font-weight: 800; line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.02em; }
    .hero h1 .gradient {
      background: linear-gradient(135deg, var(--accent) 0%, #A78BFA 50%, #EC4899 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero p { font-size: 18px; color: var(--text-muted); max-width: 560px; margin: 0 auto 32px; }
    .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    /* Live Demo */
    .demo {
      max-width: 720px; margin: 0 auto 80px; padding: 0 24px;
    }
    .demo-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
      padding: 28px; box-shadow: 0 0 80px rgba(99, 102, 241, 0.06);
    }
    .demo-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
    }
    .demo-status {
      display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px;
    }
    .status-dot {
      width: 10px; height: 10px; border-radius: 50%; animation: pulse 2s ease-in-out infinite;
    }
    .status-dot.green { background: var(--green); }
    .status-dot.red { background: var(--red); }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.2); }
    }
    .demo-monitor {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 0; border-top: 1px solid var(--border);
    }
    .demo-monitor-name { display: flex; align-items: center; gap: 10px; }
    .demo-bars { display: flex; gap: 2px; }
    .demo-bar {
      width: 5px; height: 22px; border-radius: 2px; background: var(--green); opacity: 0.7;
    }
    .demo-bar.down { background: var(--red); }

    /* Features */
    .features {
      max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px;
    }
    .features-header { text-align: center; margin-bottom: 48px; }
    .features-header h2 { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
    .features-header p { color: var(--text-muted); font-size: 16px; }
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;
    }
    .feature-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      padding: 28px; transition: border-color 0.2s;
    }
    .feature-card:hover { border-color: var(--accent); }
    .feature-icon { font-size: 28px; margin-bottom: 14px; }
    .feature-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
    .feature-card p { color: var(--text-muted); font-size: 14px; line-height: 1.6; }

    /* Pricing */
    .pricing {
      max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px;
    }
    .pricing-header { text-align: center; margin-bottom: 48px; }
    .pricing-header h2 { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
    .pricing-header p { color: var(--text-muted); font-size: 16px; }
    .pricing-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;
      max-width: 960px; margin: 0 auto;
    }
    .pricing-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
      padding: 32px; position: relative;
    }
    .pricing-card.popular {
      border-color: var(--accent);
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.1);
    }
    .popular-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: var(--accent); color: white; padding: 4px 16px; border-radius: 100px;
      font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .pricing-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
    .pricing-price { font-size: 40px; font-weight: 800; margin-bottom: 4px; }
    .pricing-price span { font-size: 16px; font-weight: 400; color: var(--text-muted); }
    .pricing-desc { color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }
    .pricing-features { list-style: none; margin-bottom: 28px; }
    .pricing-features li {
      padding: 6px 0; font-size: 14px; color: var(--text-muted);
      display: flex; align-items: center; gap: 8px;
    }
    .pricing-features li::before { content: "\\2713"; color: var(--green); font-weight: 700; }
    .pricing-card .btn { width: 100%; justify-content: center; }

    /* API Section */
    .api-section {
      max-width: 800px; margin: 0 auto; padding: 40px 24px 80px;
    }
    .api-section h2 { font-size: 32px; font-weight: 700; margin-bottom: 12px; text-align: center; }
    .api-section > p { color: var(--text-muted); font-size: 16px; text-align: center; margin-bottom: 32px; }
    .code-block {
      background: #0D1117; border: 1px solid var(--border); border-radius: 12px;
      padding: 24px; overflow-x: auto; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; line-height: 1.7;
    }
    .code-comment { color: #6A737D; }
    .code-keyword { color: #FF7B72; }
    .code-string { color: #A5D6FF; }
    .code-func { color: #D2A8FF; }

    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 40px 24px; text-align: center;
      color: var(--text-muted); font-size: 13px;
    }

    /* CTA */
    .cta {
      text-align: center; padding: 60px 24px;
      background: linear-gradient(180deg, transparent, rgba(99, 102, 241, 0.05));
      margin-bottom: 0;
    }
    .cta h2 { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
    .cta p { color: var(--text-muted); margin-bottom: 28px; font-size: 16px; }

    @media (max-width: 640px) {
      .hero h1 { font-size: 32px; }
      .hero { padding: 48px 20px 40px; }
      .pricing-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="logo">
      <span class="logo-icon">📡</span> PingBase
    </div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="/docs">API Docs</a>
      <a href="/api/auth/login" class="btn btn-outline">Log In</a>
      <a href="/api/auth/register" class="btn btn-primary">Start Free</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-badge">Now in public beta &mdash; free to start</div>
    <h1>Know when your<br><span class="gradient">services go down</span></h1>
    <p>Simple, reliable uptime monitoring with beautiful status pages your customers will love. Set up in 30 seconds.</p>
    <div class="hero-actions">
      <a href="/api/auth/register" class="btn btn-primary" style="padding:14px 32px;font-size:16px;">Start Monitoring — Free</a>
      <a href="#demo" class="btn btn-outline" style="padding:14px 32px;font-size:16px;">See Demo</a>
    </div>
  </section>

  <section class="demo" id="demo">
    <div class="demo-card">
      <div class="demo-header">
        <div class="demo-status">
          <div class="status-dot green"></div>
          All Systems Operational
        </div>
        <span style="color:var(--text-muted);font-size:13px;">Updated just now</span>
      </div>
      <div class="demo-monitor">
        <div class="demo-monitor-name">
          <div class="status-dot green" style="width:8px;height:8px;animation:none;"></div>
          <span style="font-weight:500;">API Server</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="color:var(--text-muted);font-size:13px;">42ms</span>
          <div class="demo-bars">${generateDemoBars()}</div>
          <span style="color:var(--green);font-size:13px;font-weight:600;">99.98%</span>
        </div>
      </div>
      <div class="demo-monitor">
        <div class="demo-monitor-name">
          <div class="status-dot green" style="width:8px;height:8px;animation:none;"></div>
          <span style="font-weight:500;">Web Application</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="color:var(--text-muted);font-size:13px;">128ms</span>
          <div class="demo-bars">${generateDemoBars()}</div>
          <span style="color:var(--green);font-size:13px;font-weight:600;">100%</span>
        </div>
      </div>
      <div class="demo-monitor">
        <div class="demo-monitor-name">
          <div class="status-dot green" style="width:8px;height:8px;animation:none;"></div>
          <span style="font-weight:500;">Database Cluster</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="color:var(--text-muted);font-size:13px;">8ms</span>
          <div class="demo-bars">${generateDemoBars()}</div>
          <span style="color:var(--green);font-size:13px;font-weight:600;">99.99%</span>
        </div>
      </div>
    </div>
  </section>

  <section class="features" id="features">
    <div class="features-header">
      <h2>Everything you need to stay online</h2>
      <p>Powerful monitoring tools, dead-simple to set up.</p>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>30-Second Checks</h3>
        <p>Monitor your endpoints every 30 seconds from multiple regions. Know about issues before your customers do.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Beautiful Status Pages</h3>
        <p>Gorgeous, auto-updating status pages your customers will love. Custom branding, dark mode, and your own domain.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔔</div>
        <h3>Instant Alerts</h3>
        <p>Get notified via email, Slack, or webhooks the moment something goes down. Never miss an outage again.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📈</div>
        <h3>Uptime Analytics</h3>
        <p>Response time charts, uptime percentages, and incident history. Show your SLA compliance at a glance.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔌</div>
        <h3>REST API</h3>
        <p>Full API access to create monitors, fetch stats, and manage status pages programmatically. Automate everything.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🛡️</div>
        <h3>Incident Management</h3>
        <p>Automatic incident detection and resolution tracking. Know exactly when things went wrong and when they recovered.</p>
      </div>
    </div>
  </section>

  <section class="pricing" id="pricing">
    <div class="pricing-header">
      <h2>Simple, honest pricing</h2>
      <p>Start free, upgrade when you need more. No hidden fees, cancel anytime.</p>
    </div>
    <div class="pricing-grid">
      <div class="pricing-card">
        <h3>Free</h3>
        <div class="pricing-price">$0<span>/month</span></div>
        <div class="pricing-desc">Perfect for side projects and personal sites.</div>
        <ul class="pricing-features">
          <li>3 monitors</li>
          <li>5-minute check interval</li>
          <li>Email alerts</li>
          <li>1 status page</li>
          <li>7-day data retention</li>
        </ul>
        <a href="/api/auth/register" class="btn btn-outline">Get Started</a>
      </div>
      <div class="pricing-card popular">
        <div class="popular-badge">Most Popular</div>
        <h3>Pro</h3>
        <div class="pricing-price">$12<span>/month</span></div>
        <div class="pricing-desc">For growing SaaS products and businesses.</div>
        <ul class="pricing-features">
          <li>25 monitors</li>
          <li>30-second check interval</li>
          <li>Email, Slack & Webhook alerts</li>
          <li>Unlimited status pages</li>
          <li>Custom branding</li>
          <li>90-day data retention</li>
          <li>Full API access</li>
        </ul>
        <a href="/api/billing/checkout" class="btn btn-primary">Start Pro Trial</a>
      </div>
      <div class="pricing-card">
        <h3>Business</h3>
        <div class="pricing-price">$49<span>/month</span></div>
        <div class="pricing-desc">For teams with serious uptime requirements.</div>
        <ul class="pricing-features">
          <li>100 monitors</li>
          <li>30-second check interval</li>
          <li>All Pro features</li>
          <li>Custom domains</li>
          <li>Team members (coming soon)</li>
          <li>1-year data retention</li>
          <li>Priority support</li>
        </ul>
        <a href="/api/billing/checkout" class="btn btn-outline">Contact Sales</a>
      </div>
    </div>
  </section>

  <section class="api-section" id="api">
    <h2>Developer-first API</h2>
    <p>Integrate PingBase into your workflow with our simple REST API.</p>
    <div class="code-block">
<span class="code-comment">// Create a monitor with a single API call</span>
<span class="code-keyword">const</span> response = <span class="code-keyword">await</span> <span class="code-func">fetch</span>(<span class="code-string">'${config.baseUrl}/api/monitors'</span>, {
  <span class="code-keyword">method</span>: <span class="code-string">'POST'</span>,
  <span class="code-keyword">headers</span>: {
    <span class="code-string">'Content-Type'</span>: <span class="code-string">'application/json'</span>,
    <span class="code-string">'X-API-Key'</span>: <span class="code-string">'pb_your_api_key'</span>
  },
  <span class="code-keyword">body</span>: JSON.<span class="code-func">stringify</span>({
    <span class="code-keyword">name</span>: <span class="code-string">'Production API'</span>,
    <span class="code-keyword">url</span>: <span class="code-string">'https://api.example.com/health'</span>,
    <span class="code-keyword">checkInterval</span>: <span class="code-string">30</span>
  })
});

<span class="code-comment">// Response:</span>
<span class="code-comment">// { "monitor": { "id": "...", "name": "Production API", "status": "unknown" } }</span>
    </div>
  </section>

  <section class="cta">
    <h2>Start monitoring in 30 seconds</h2>
    <p>Free plan includes 3 monitors. No credit card required.</p>
    <a href="/api/auth/register" class="btn btn-primary" style="padding:14px 36px;font-size:16px;">Start Free Monitoring</a>
  </section>

  <footer>
    <p>&copy; ${new Date().getFullYear()} PingBase. Reliable uptime monitoring for modern teams.</p>
  </footer>
</body>
</html>`;
}

function generateDemoBars(): string {
  const bars: string[] = [];
  for (let i = 0; i < 30; i++) {
    const isDown = i === 18; // one red bar for realism
    bars.push(`<div class="demo-bar${isDown ? ' down' : ''}"></div>`);
  }
  return bars.join('');
}
