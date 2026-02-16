import { config } from '../config';

export function renderDashboardPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard — Praised</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    :root{--bg:#f8fafc;--surface:#fff;--border:#e8ecf4;--text:#0f172a;--muted:#64748b;--light:#94a3b8;--accent:#6366f1;--accent2:#818cf8;--accent-bg:rgba(99,102,241,0.06);--green:#10b981;--amber:#f59e0b;--red:#ef4444;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text);line-height:1.5;}

    /* Nav */
    .topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:56px;position:sticky;top:0;z-index:10;}
    .topbar-logo{font-size:18px;font-weight:800;display:flex;align-items:center;gap:6px;}
    .topbar-right{display:flex;align-items:center;gap:16px;}
    .topbar-plan{font-size:12px;font-weight:600;padding:4px 10px;border-radius:100px;background:var(--accent-bg);color:var(--accent);text-transform:uppercase;}
    .topbar-user{font-size:14px;color:var(--muted);}
    .topbar-btn{font-size:13px;color:var(--muted);background:none;border:none;cursor:pointer;font-family:inherit;}
    .topbar-btn:hover{color:var(--text);}

    /* Layout */
    .container{max-width:960px;margin:0 auto;padding:24px;}

    /* Tabs */
    .tabs{display:flex;gap:4px;margin-bottom:24px;border-bottom:1px solid var(--border);padding-bottom:0;}
    .tab{padding:10px 18px;font-size:14px;font-weight:500;color:var(--muted);cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-1px;font-family:inherit;}
    .tab:hover{color:var(--text);}
    .tab.active{color:var(--accent);border-bottom-color:var(--accent);font-weight:600;}

    /* Cards */
    .card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:16px;}
    .card h2{font-size:18px;font-weight:700;margin-bottom:4px;}
    .card p.desc{color:var(--muted);font-size:14px;margin-bottom:16px;}

    /* Usage bar */
    .usage-row{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
    .usage-label{font-size:13px;font-weight:500;min-width:100px;color:var(--muted);}
    .usage-bar{flex:1;height:8px;background:#e2e8f0;border-radius:100px;overflow:hidden;}
    .usage-fill{height:100%;border-radius:100px;transition:width .3s;}
    .usage-fill.green{background:var(--green);}
    .usage-fill.amber{background:var(--amber);}
    .usage-fill.red{background:var(--red);}
    .usage-count{font-size:13px;font-weight:600;min-width:60px;text-align:right;}

    /* Upgrade banner */
    .upgrade-banner{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:14px;padding:20px 24px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
    .upgrade-banner h3{font-size:16px;font-weight:700;}
    .upgrade-banner p{font-size:14px;opacity:.9;}
    .upgrade-btn{background:#fff;color:#6366f1;border:none;padding:10px 20px;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;}
    .upgrade-btn:hover{opacity:.9;}

    /* Space cards */
    .space-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
    .space-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;cursor:pointer;transition:border-color .15s;}
    .space-card:hover{border-color:var(--accent);}
    .space-name{font-size:16px;font-weight:600;margin-bottom:4px;}
    .space-slug{font-size:13px;color:var(--light);margin-bottom:12px;}
    .space-stats{display:flex;gap:16px;}
    .space-stat{font-size:13px;color:var(--muted);}
    .space-stat strong{color:var(--text);}

    /* Testimonials list */
    .t-item{display:flex;align-items:flex-start;gap:14px;padding:16px 0;border-bottom:1px solid var(--border);}
    .t-item:last-child{border-bottom:none;}
    .t-avatar{width:40px;height:40px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0;}
    .t-body{flex:1;min-width:0;}
    .t-author{font-weight:600;font-size:14px;}
    .t-role{font-size:12px;color:var(--muted);}
    .t-content{font-size:14px;color:#334155;margin-top:6px;line-height:1.6;}
    .t-meta{display:flex;align-items:center;gap:8px;margin-top:8px;}
    .t-stars{color:var(--amber);font-size:13px;}
    .badge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:100px;}
    .badge-pending{background:#fef3c7;color:#92400e;}
    .badge-approved{background:#d1fae5;color:#065f46;}
    .badge-rejected{background:#fee2e2;color:#991b1b;}
    .t-actions{display:flex;gap:6px;flex-shrink:0;align-self:center;}
    .t-btn{padding:6px 12px;font-size:12px;font-weight:600;border-radius:8px;border:1px solid var(--border);background:var(--surface);cursor:pointer;font-family:inherit;color:var(--muted);}
    .t-btn:hover{border-color:var(--accent);color:var(--accent);}
    .t-btn.approve{color:var(--green);border-color:var(--green);}
    .t-btn.approve:hover{background:#d1fae5;}
    .t-btn.reject{color:var(--red);border-color:var(--red);}
    .t-btn.reject:hover{background:#fee2e2;}

    /* Forms */
    .form-group{margin-bottom:14px;}
    .form-group label{display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:5px;}
    .form-group input,.form-group select{width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:inherit;background:var(--bg);}
    .form-group input:focus,.form-group select:focus{outline:none;border-color:var(--accent);background:var(--surface);}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

    .btn{display:inline-flex;align-items:center;padding:10px 20px;border-radius:10px;font-weight:600;font-size:14px;border:none;cursor:pointer;font-family:inherit;transition:all .15s;}
    .btn-primary{background:var(--accent);color:#fff;}
    .btn-primary:hover{background:var(--accent2);}
    .btn-outline{border:1.5px solid var(--border);color:var(--text);background:var(--surface);}
    .btn-outline:hover{border-color:var(--accent);}
    .btn-sm{padding:8px 14px;font-size:13px;}
    .btn:disabled{opacity:.6;cursor:not-allowed;}

    .empty{text-align:center;padding:40px;color:var(--muted);}
    .empty h3{font-size:18px;font-weight:600;color:var(--text);margin-bottom:6px;}

    /* Embed box */
    .embed-box{background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px 18px;font-family:'SF Mono','Fira Code',monospace;font-size:13px;line-height:1.6;overflow-x:auto;margin-top:8px;position:relative;}
    .copy-btn{position:absolute;top:8px;right:8px;background:#334155;color:#e2e8f0;border:none;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;font-family:inherit;}
    .copy-btn:hover{background:#475569;}

    /* Back nav */
    .back-link{display:inline-flex;align-items:center;gap:6px;font-size:14px;color:var(--muted);margin-bottom:16px;cursor:pointer;border:none;background:none;font-family:inherit;}
    .back-link:hover{color:var(--text);}

    /* Billing pricing cards */
    .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:16px;}
    .price-card{border:1.5px solid var(--border);border-radius:14px;padding:24px;position:relative;}
    .price-card.current{border-color:var(--accent);background:var(--accent-bg);}
    .price-card h3{font-size:16px;font-weight:600;margin-bottom:4px;}
    .price-amt{font-size:32px;font-weight:800;margin-bottom:2px;}
    .price-amt span{font-size:14px;font-weight:400;color:var(--muted);}
    .price-list{list-style:none;margin:12px 0 18px;}
    .price-list li{padding:4px 0;font-size:13px;color:#475569;}
    .price-list li::before{content:"\\2713";color:var(--green);font-weight:700;margin-right:7px;}
    .period-toggle{display:flex;gap:4px;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:3px;margin-bottom:16px;width:fit-content;}
    .period-opt{padding:6px 16px;font-size:13px;font-weight:500;border-radius:8px;border:none;cursor:pointer;font-family:inherit;background:transparent;color:var(--muted);}
    .period-opt.active{background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,0.08);}
    .save-badge{font-size:11px;color:var(--green);font-weight:600;margin-left:6px;}

    @media(max-width:650px){
      .pricing-grid{grid-template-columns:1fr;}
      .space-grid{grid-template-columns:1fr;}
      .form-row{grid-template-columns:1fr;}
      .t-item{flex-direction:column;}
      .t-actions{align-self:flex-start;}
    }

    /* Modal overlay */
    .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:100;align-items:center;justify-content:center;padding:20px;}
    .modal-overlay.open{display:flex;}
    .modal{background:var(--surface);border-radius:16px;padding:28px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.15);}
    .modal h2{font-size:18px;font-weight:700;margin-bottom:16px;}
    .modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;}
  </style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-logo">&#10024; Praised</div>
    <div class="topbar-right">
      <span class="topbar-plan" id="planBadge">free</span>
      <span class="topbar-user" id="userName"></span>
      <button class="topbar-btn" onclick="logout()">Log out</button>
    </div>
  </div>

  <div class="container" id="app">
    <div id="loading" class="empty"><p>Loading...</p></div>
  </div>

  <!-- Create Space Modal -->
  <div class="modal-overlay" id="createSpaceModal">
    <div class="modal">
      <h2>Create a Space</h2>
      <div id="createSpaceError" class="error" style="display:none;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:14px;"></div>
      <form id="createSpaceForm">
        <div class="form-group">
          <label>Space name</label>
          <input type="text" id="csName" placeholder="My Product" required>
        </div>
        <div class="form-group">
          <label>Slug (URL-friendly)</label>
          <input type="text" id="csSlug" placeholder="my-product" pattern="^[a-z0-9][a-z0-9-]*[a-z0-9]$" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Brand color</label>
            <input type="color" id="csBrandColor" value="#6366f1">
          </div>
          <div class="form-group">
            <label>Website URL</label>
            <input type="url" id="csWebsite" placeholder="https://example.com">
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" onclick="closeModal('createSpaceModal')">Cancel</button>
          <button type="submit" class="btn btn-primary" id="createSpaceBtn">Create Space</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const BASE = '';
    let token = localStorage.getItem('praised_token');
    let user = null;
    let currentView = 'spaces'; // spaces | space-detail | billing
    let spaces = [];
    let activeSpace = null;
    let billingPeriod = 'monthly';

    // Boot
    if (!token) { window.location.href = '/login'; }
    else { init(); }

    async function init() {
      try {
        user = await api('GET', '/api/auth/me');
        document.getElementById('userName').textContent = user.email;
        document.getElementById('planBadge').textContent = user.plan;

        // Check URL for hash-based routing
        if (window.location.hash === '#billing') {
          showBilling();
        } else {
          showSpaces();
        }
      } catch (e) {
        localStorage.removeItem('praised_token');
        window.location.href = '/login';
      }
    }

    async function api(method, path, body) {
      const opts = {
        method,
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(BASE + path, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    }

    function logout() {
      localStorage.removeItem('praised_token');
      localStorage.removeItem('praised_user');
      window.location.href = '/login';
    }

    // ========================
    // SPACES VIEW
    // ========================
    async function showSpaces() {
      currentView = 'spaces';
      window.location.hash = '';
      const app = document.getElementById('app');

      try {
        const [spaceData, billing] = await Promise.all([
          api('GET', '/api/spaces'),
          api('GET', '/api/billing'),
        ]);
        spaces = spaceData.spaces;

        let html = '';

        // Usage banner for free users
        if (billing.plan === 'free') {
          const sPct = Math.round((billing.usage.spaces / ${config.freeSpaces}) * 100);
          const tPct = Math.round((billing.usage.testimonials / ${config.freeTestimonials}) * 100);
          const tColor = tPct >= 80 ? 'red' : tPct >= 50 ? 'amber' : 'green';
          const sColor = sPct >= 80 ? 'red' : sPct >= 50 ? 'amber' : 'green';

          html += \`
            <div class="card" style="margin-bottom:20px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                <h2 style="font-size:15px;font-weight:600;">Usage</h2>
                <button class="btn btn-sm btn-primary" onclick="showBilling()">Upgrade</button>
              </div>
              <div class="usage-row">
                <span class="usage-label">Spaces</span>
                <div class="usage-bar"><div class="usage-fill \${sColor}" style="width:\${Math.min(sPct,100)}%"></div></div>
                <span class="usage-count">\${billing.usage.spaces} / ${config.freeSpaces}</span>
              </div>
              <div class="usage-row">
                <span class="usage-label">Testimonials</span>
                <div class="usage-bar"><div class="usage-fill \${tColor}" style="width:\${Math.min(tPct,100)}%"></div></div>
                <span class="usage-count">\${billing.usage.testimonials} / ${config.freeTestimonials}</span>
              </div>
            </div>\`;
        }

        // Tabs
        html += \`<div class="tabs">
          <button class="tab active" onclick="showSpaces()">Spaces</button>
          <button class="tab" onclick="showBilling()">Billing</button>
        </div>\`;

        // Spaces header
        html += \`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h2 style="font-size:20px;font-weight:700;">Your Spaces</h2>
          <button class="btn btn-primary btn-sm" onclick="openModal('createSpaceModal')">+ New Space</button>
        </div>\`;

        if (spaces.length === 0) {
          html += \`<div class="empty">
            <h3>No spaces yet</h3>
            <p>Create your first space to start collecting testimonials.</p>
            <button class="btn btn-primary" style="margin-top:16px;" onclick="openModal('createSpaceModal')">Create a Space</button>
          </div>\`;
        } else {
          html += '<div class="space-grid">';
          for (const s of spaces) {
            html += \`<div class="space-card" onclick="showSpaceDetail('\${s.id}')">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <div style="width:12px;height:12px;border-radius:50%;background:\${s.brand_color || '#6366f1'};"></div>
                <div class="space-name">\${esc(s.name)}</div>
              </div>
              <div class="space-slug">/collect/\${esc(s.slug)}</div>
              <div class="space-stats">
                <span class="space-stat"><strong>\${s.approvedCount || 0}</strong> approved</span>
                <span class="space-stat"><strong>\${s.pendingCount || 0}</strong> pending</span>
              </div>
            </div>\`;
          }
          html += '</div>';
        }

        app.innerHTML = html;
      } catch (e) {
        app.innerHTML = '<div class="empty"><p>Failed to load: ' + esc(e.message) + '</p></div>';
      }
    }

    // ========================
    // SPACE DETAIL VIEW
    // ========================
    async function showSpaceDetail(spaceId) {
      currentView = 'space-detail';
      const app = document.getElementById('app');
      app.innerHTML = '<div class="empty"><p>Loading...</p></div>';

      try {
        const [spaceData, testimonialsData] = await Promise.all([
          api('GET', '/api/spaces/' + spaceId),
          api('GET', '/api/testimonials/space/' + spaceId),
        ]);
        activeSpace = spaceData.space;
        const testimonials = testimonialsData.testimonials;

        let html = '';

        // Back nav
        html += '<button class="back-link" onclick="showSpaces()">&larr; All Spaces</button>';

        // Space header
        html += \`<div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <div style="width:16px;height:16px;border-radius:50%;background:\${activeSpace.brand_color || '#6366f1'};"></div>
            <h2>\${esc(activeSpace.name)}</h2>
          </div>

          <div style="margin-bottom:14px;">
            <div style="font-size:13px;font-weight:600;color:var(--muted);margin-bottom:6px;">Collection link</div>
            <div class="embed-box" style="font-size:14px;">
              ${config.baseUrl}/api/testimonials/collect/\${esc(activeSpace.slug)}
              <button class="copy-btn" onclick="copyText('${config.baseUrl}/api/testimonials/collect/\${esc(activeSpace.slug)}')">Copy</button>
            </div>
          </div>

          <div>
            <div style="font-size:13px;font-weight:600;color:var(--muted);margin-bottom:6px;">Embed code</div>
            <div class="embed-box">
              &lt;script src="${config.baseUrl}/widgets/embed/\${esc(activeSpace.slug)}.js"&gt;&lt;/script&gt;
              <button class="copy-btn" onclick="copyText('<script src=&quot;${config.baseUrl}/widgets/embed/\${esc(activeSpace.slug)}.js&quot;><\\/script>')">Copy</button>
            </div>
          </div>
        </div>\`;

        // Testimonials
        html += \`<div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0 12px;">
          <h2 style="font-size:18px;font-weight:700;">Testimonials (\${testimonials.length})</h2>
          <a href="${config.baseUrl}/widgets/wall/\${esc(activeSpace.slug)}" target="_blank" class="btn btn-outline btn-sm">View Wall</a>
        </div>\`;

        if (testimonials.length === 0) {
          html += '<div class="empty"><h3>No testimonials yet</h3><p>Share the collection link above with your customers.</p></div>';
        } else {
          html += '<div class="card" style="padding:8px 20px;">';
          for (const t of testimonials) {
            const initial = t.author_name ? t.author_name.charAt(0).toUpperCase() : '?';
            const subtitle = [t.author_title, t.author_company].filter(Boolean).join(' at ');
            const stars = Array.from({length:5}, (_,i) =>
              '<span style="color:' + (i < t.rating ? 'var(--amber)' : '#e2e8f0') + ';">&#9733;</span>'
            ).join('');
            const statusClass = t.status === 'approved' ? 'badge-approved' : t.status === 'rejected' ? 'badge-rejected' : 'badge-pending';

            html += \`<div class="t-item">
              <div class="t-avatar" style="background:\${activeSpace.brand_color || '#6366f1'};">\${initial}</div>
              <div class="t-body">
                <div class="t-author">\${esc(t.author_name)}</div>
                \${subtitle ? '<div class="t-role">' + esc(subtitle) + '</div>' : ''}
                <div class="t-content">\${esc(t.content)}</div>
                <div class="t-meta">
                  <span class="t-stars">\${stars}</span>
                  <span class="badge \${statusClass}">\${t.status}</span>
                </div>
              </div>
              <div class="t-actions">
                \${t.status !== 'approved' ? '<button class="t-btn approve" onclick="updateTestimonial(\\'' + t.id + '\\', \\'approved\\')">Approve</button>' : ''}
                \${t.status !== 'rejected' ? '<button class="t-btn reject" onclick="updateTestimonial(\\'' + t.id + '\\', \\'rejected\\')">Reject</button>' : ''}
              </div>
            </div>\`;
          }
          html += '</div>';
        }

        app.innerHTML = html;
      } catch (e) {
        app.innerHTML = '<div class="empty"><p>Error: ' + esc(e.message) + '</p></div>';
      }
    }

    async function updateTestimonial(id, status) {
      try {
        await api('PATCH', '/api/testimonials/' + id, { status });
        showSpaceDetail(activeSpace.id);
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }

    // ========================
    // BILLING VIEW
    // ========================
    async function showBilling() {
      currentView = 'billing';
      window.location.hash = 'billing';
      const app = document.getElementById('app');
      app.innerHTML = '<div class="empty"><p>Loading...</p></div>';

      try {
        const billing = await api('GET', '/api/billing');

        let html = '';
        html += \`<div class="tabs">
          <button class="tab" onclick="showSpaces()">Spaces</button>
          <button class="tab active" onclick="showBilling()">Billing</button>
        </div>\`;

        html += '<h2 style="font-size:20px;font-weight:700;margin-bottom:16px;">Plan & Billing</h2>';

        // Usage
        html += \`<div class="card">
          <h2>Current Usage</h2>
          <p class="desc">You are on the <strong>\${billing.plan}</strong> plan.</p>
          <div class="usage-row">
            <span class="usage-label">Spaces</span>
            <span class="usage-count">\${billing.usage.spaces} / \${billing.limits[billing.plan]?.spaces === 'unlimited' ? '&infin;' : billing.limits[billing.plan]?.spaces || billing.limits.free.spaces}</span>
          </div>
          <div class="usage-row">
            <span class="usage-label">Testimonials</span>
            <span class="usage-count">\${billing.usage.testimonials} / \${billing.limits[billing.plan]?.testimonials === 'unlimited' ? '&infin;' : billing.limits[billing.plan]?.testimonials || billing.limits.free.testimonials}</span>
          </div>
        </div>\`;

        // Period toggle
        html += \`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <h2 style="font-size:18px;font-weight:700;">Plans</h2>
          <div class="period-toggle">
            <button class="period-opt \${billingPeriod === 'monthly' ? 'active' : ''}" onclick="billingPeriod='monthly';showBilling();">Monthly</button>
            <button class="period-opt \${billingPeriod === 'annual' ? 'active' : ''}" onclick="billingPeriod='annual';showBilling();">Annual<span class="save-badge">Save 25%</span></button>
          </div>
        </div>\`;

        // Pricing cards
        html += '<div class="pricing-grid">';
        for (const plan of billing.plans) {
          const isCurrent = billing.plan === plan.id;
          const price = billingPeriod === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price;
          const suffix = plan.price === 0 ? '' : billingPeriod === 'annual' ? '/mo, billed annually' : '/mo';

          html += \`<div class="price-card \${isCurrent ? 'current' : ''}">
            <h3>\${plan.name}\${isCurrent ? ' <span style="font-size:12px;color:var(--accent);">(Current)</span>' : ''}</h3>
            <div class="price-amt">\${plan.price === 0 ? 'Free' : '$' + price}<span>\${suffix}</span></div>
            <ul class="price-list">\${plan.features.map(f => '<li>' + f + '</li>').join('')}</ul>
            \${!isCurrent && plan.price > 0 ? '<button class="btn btn-primary" style="width:100%;" onclick="checkout(\\'' + plan.id + '\\')">Upgrade to ' + plan.name + '</button>' : ''}
            \${isCurrent && plan.price === 0 ? '<button class="btn btn-outline" style="width:100%;cursor:default;" disabled>Current Plan</button>' : ''}
            \${isCurrent && plan.price > 0 ? '<button class="btn btn-outline" style="width:100%;cursor:default;" disabled>Current Plan</button>' : ''}
          </div>\`;
        }
        html += '</div>';

        app.innerHTML = html;
      } catch (e) {
        app.innerHTML = '<div class="empty"><p>Error: ' + esc(e.message) + '</p></div>';
      }
    }

    async function checkout(plan) {
      try {
        const data = await api('POST', '/api/billing/checkout', { plan, period: billingPeriod });
        if (data.url) window.location.href = data.url;
        else alert('Billing not configured yet.');
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }

    // ========================
    // CREATE SPACE
    // ========================
    document.getElementById('createSpaceForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('createSpaceBtn');
      const errEl = document.getElementById('createSpaceError');
      btn.disabled = true;
      btn.textContent = 'Creating...';
      errEl.style.display = 'none';
      try {
        await api('POST', '/api/spaces', {
          name: document.getElementById('csName').value,
          slug: document.getElementById('csSlug').value,
          brandColor: document.getElementById('csBrandColor').value,
          websiteUrl: document.getElementById('csWebsite').value,
        });
        closeModal('createSpaceModal');
        document.getElementById('createSpaceForm').reset();
        showSpaces();
      } catch (e) {
        errEl.textContent = e.message;
        errEl.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create Space';
      }
    });

    // Auto-generate slug from name
    document.getElementById('csName').addEventListener('input', (e) => {
      document.getElementById('csSlug').value = e.target.value
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    });

    // ========================
    // HELPERS
    // ========================
    function openModal(id) { document.getElementById(id).classList.add('open'); }
    function closeModal(id) { document.getElementById(id).classList.remove('open'); }

    function esc(s) {
      if (!s) return '';
      const d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    function copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        // Brief visual feedback
        event.target.textContent = 'Copied!';
        setTimeout(() => { event.target.textContent = 'Copy'; }, 1500);
      });
    }

    // Handle billing=success in URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') === 'success') {
      // Refresh user info after successful billing
      setTimeout(() => {
        api('GET', '/api/auth/me').then(u => {
          user = u;
          document.getElementById('planBadge').textContent = u.plan;
          localStorage.setItem('praised_user', JSON.stringify(u));
        });
      }, 1000);
    }
  </script>
</body>
</html>`;
}
