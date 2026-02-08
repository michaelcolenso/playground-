import { config } from '../config';

export function renderLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Praised — Collect & Showcase Customer Testimonials</title>
  <meta name="description" content="Turn happy customers into your best marketing. Collect testimonials with a simple link, showcase them with a beautiful embeddable widget.">
  <meta property="og:title" content="Praised — Customer Testimonials Made Easy">
  <meta property="og:description" content="Collect, manage, and showcase customer testimonials. Beautiful widgets that convert.">
  <meta property="og:image" content="${config.baseUrl}/og-image.svg">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="640">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${config.baseUrl}/og-image.svg">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    :root{
      --bg:#fafbfe;--surface:#fff;--border:#e8ecf4;
      --text:#0f172a;--muted:#64748b;--light:#94a3b8;
      --accent:#6366f1;--accent2:#818cf8;--accent-bg:rgba(99,102,241,0.06);
      --green:#10b981;--amber:#f59e0b;
    }
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased;}
    a{color:var(--accent);text-decoration:none;}

    /* Nav */
    nav{display:flex;justify-content:space-between;align-items:center;max-width:1060px;margin:0 auto;padding:18px 24px;}
    .logo{font-size:20px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:6px;}
    .nav-links{display:flex;gap:20px;align-items:center;}
    .nav-links a{color:var(--muted);font-size:14px;font-weight:500;}
    .nav-links a:hover{color:var(--text);}
    .btn{display:inline-flex;align-items:center;padding:10px 20px;border-radius:10px;font-weight:600;font-size:14px;border:none;cursor:pointer;transition:all .15s;}
    .btn-primary{background:var(--accent);color:#fff;}
    .btn-primary:hover{background:var(--accent2);transform:translateY(-1px);box-shadow:0 4px 20px rgba(99,102,241,.25);}
    .btn-ghost{color:var(--muted);background:transparent;}
    .btn-ghost:hover{color:var(--text);background:var(--accent-bg);}
    .btn-outline{border:1.5px solid var(--border);color:var(--text);background:var(--surface);}
    .btn-outline:hover{border-color:var(--accent);background:var(--accent-bg);}

    /* Hero */
    .hero{text-align:center;max-width:720px;margin:0 auto;padding:72px 24px 48px;}
    .hero-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:100px;background:var(--accent-bg);border:1px solid rgba(99,102,241,.12);color:var(--accent);font-size:13px;font-weight:600;margin-bottom:20px;}
    .hero h1{font-size:50px;font-weight:800;line-height:1.08;margin-bottom:18px;letter-spacing:-0.03em;}
    .hero h1 em{font-style:normal;background:linear-gradient(135deg,var(--accent),#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .hero p{font-size:18px;color:var(--muted);max-width:520px;margin:0 auto 28px;}
    .hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}

    /* Social proof */
    .social-proof{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px;color:var(--muted);font-size:13px;}
    .avatars{display:flex;}
    .avatars span{width:28px;height:28px;border-radius:50%;border:2px solid var(--bg);margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;}
    .avatars span:first-child{margin-left:0;}

    /* Demo Card */
    .demo-section{max-width:820px;margin:0 auto 56px;padding:0 24px;}
    .demo-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;box-shadow:0 1px 2px rgba(0,0,0,0.02),0 12px 40px rgba(0,0,0,0.04);}
    .demo-label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--light);margin-bottom:14px;}
    .masonry{columns:3;column-gap:14px;}
    .t-card{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:18px;break-inside:avoid;margin-bottom:14px;}
    .t-stars{margin-bottom:8px;color:var(--amber);font-size:14px;}
    .t-text{color:#334155;font-size:14px;line-height:1.6;margin-bottom:12px;}
    .t-author{display:flex;align-items:center;gap:8px;}
    .t-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;}
    .t-name{font-size:13px;font-weight:600;color:var(--text);}
    .t-role{font-size:11px;color:var(--muted);}
    @media(max-width:650px){.masonry{columns:1;}}

    /* How it works */
    .steps{max-width:860px;margin:0 auto;padding:48px 24px 56px;}
    .steps-header{text-align:center;margin-bottom:36px;}
    .steps-header h2{font-size:30px;font-weight:700;margin-bottom:8px;}
    .steps-header p{color:var(--muted);font-size:16px;}
    .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .step{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px;text-align:center;}
    .step-num{width:36px;height:36px;border-radius:50%;background:var(--accent-bg);color:var(--accent);font-weight:700;font-size:15px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;}
    .step h3{font-size:16px;font-weight:600;margin-bottom:6px;}
    .step p{color:var(--muted);font-size:13px;line-height:1.5;}
    @media(max-width:650px){.steps-grid{grid-template-columns:1fr;}}

    /* Features */
    .features{max-width:960px;margin:0 auto;padding:24px 24px 56px;}
    .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
    .feat{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;transition:border-color .2s;}
    .feat:hover{border-color:var(--accent);}
    .feat-icon{font-size:24px;margin-bottom:10px;}
    .feat h3{font-size:15px;font-weight:600;margin-bottom:4px;}
    .feat p{color:var(--muted);font-size:13px;line-height:1.5;}
    @media(max-width:650px){.features-grid{grid-template-columns:1fr;}}

    /* Pricing */
    .pricing{max-width:960px;margin:0 auto;padding:48px 24px 56px;}
    .pricing-header{text-align:center;margin-bottom:36px;}
    .pricing-header h2{font-size:30px;font-weight:700;margin-bottom:8px;}
    .pricing-header p{color:var(--muted);font-size:16px;}
    .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:880px;margin:0 auto;}
    .price-card{background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:28px;position:relative;}
    .price-card.pop{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),0 8px 32px rgba(99,102,241,.1);}
    .pop-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--accent);color:white;padding:3px 14px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}
    .price-card h3{font-size:17px;font-weight:600;margin-bottom:6px;}
    .price-amt{font-size:38px;font-weight:800;margin-bottom:2px;}
    .price-amt span{font-size:15px;font-weight:400;color:var(--muted);}
    .price-desc{color:var(--muted);font-size:13px;margin-bottom:20px;}
    .price-list{list-style:none;margin-bottom:22px;}
    .price-list li{padding:5px 0;font-size:13px;color:#475569;display:flex;align-items:center;gap:7px;}
    .price-list li::before{content:"\\2713";color:var(--green);font-weight:700;font-size:13px;}
    .price-card .btn{width:100%;justify-content:center;}
    @media(max-width:650px){.pricing-grid{grid-template-columns:1fr;}}

    /* Embed code section */
    .embed-section{max-width:660px;margin:0 auto;padding:24px 24px 56px;text-align:center;}
    .embed-section h2{font-size:28px;font-weight:700;margin-bottom:8px;}
    .embed-section>p{color:var(--muted);font-size:15px;margin-bottom:24px;}
    .code{background:#0f172a;border-radius:12px;padding:20px;text-align:left;font-family:'SF Mono','Fira Code',monospace;font-size:13px;color:#e2e8f0;line-height:1.7;overflow-x:auto;}
    .code .comment{color:#64748b;}
    .code .tag{color:#f472b6;}
    .code .attr{color:#a78bfa;}
    .code .str{color:#67e8f9;}

    /* CTA */
    .cta{text-align:center;padding:56px 24px;background:linear-gradient(180deg,var(--bg),var(--accent-bg));}
    .cta h2{font-size:30px;font-weight:700;margin-bottom:8px;}
    .cta p{color:var(--muted);margin-bottom:24px;font-size:16px;}

    footer{border-top:1px solid var(--border);padding:32px 24px;text-align:center;color:var(--light);font-size:13px;}
  </style>
</head>
<body>
  <nav>
    <div class="logo">&#10024; Praised</div>
    <div class="nav-links">
      <a href="#how">How It Works</a>
      <a href="#pricing">Pricing</a>
      <a href="/docs">API</a>
      <a href="/api/auth/login" class="btn btn-ghost">Log In</a>
      <a href="/api/auth/register" class="btn btn-primary">Get Started Free</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-pill">&#127775; Now in public beta</div>
    <h1>Turn happy customers into your <em>best marketing</em></h1>
    <p>Collect testimonials with a simple link. Showcase them with a gorgeous embeddable widget. Watch your conversion rate climb.</p>
    <div class="hero-actions">
      <a href="/api/auth/register" class="btn btn-primary" style="padding:14px 28px;font-size:16px;">Start Collecting — Free</a>
      <a href="#demo" class="btn btn-outline" style="padding:14px 28px;font-size:16px;">See Demo</a>
    </div>
    <div class="social-proof">
      <div class="avatars">
        <span style="background:#6366f1;">S</span>
        <span style="background:#ec4899;">A</span>
        <span style="background:#f59e0b;">M</span>
        <span style="background:#10b981;">J</span>
      </div>
      Join 200+ businesses collecting social proof
    </div>
  </section>

  <section class="demo-section" id="demo">
    <div class="demo-card">
      <div class="demo-label">Wall of Love — Live Preview</div>
      <div class="masonry">
        ${demoCard('Sarah Chen', 'Head of Growth', 'Acme Inc', '#6366f1', 5,
          'Praised made it incredibly easy to collect testimonials from our customers. We embedded the wall on our landing page and saw a 23% increase in conversions within the first month.')}
        ${demoCard('Marcus Johnson', 'Founder', 'ShipFast', '#ec4899', 5,
          'The collection form is so polished that customers actually enjoy filling it out. We went from 3 testimonials to 47 in two weeks.')}
        ${demoCard('Aisha Patel', 'Product Lead', 'CloudSync', '#10b981', 5,
          'Dead simple. Create a space, send the link, embed the widget. Took us literally 5 minutes to get social proof on our pricing page.')}
        ${demoCard('James Wright', 'CEO', 'DevStack', '#f59e0b', 4,
          'We tried building our own testimonial system. Then we found Praised and deleted 2000 lines of code. Worth every penny.')}
        ${demoCard('Lin Wei', 'Marketing', 'Nova AI', '#8b5cf6', 5,
          'The embed widget looks native to our site. Customers think we built it ourselves. That\'s the best compliment I can give.')}
        ${demoCard('Emma Torres', 'Freelancer', '', '#06b6d4', 5,
          'As a freelancer, social proof is everything. I send every client the Praised link after a project. My portfolio page now sells itself.')}
      </div>
    </div>
  </section>

  <section class="steps" id="how">
    <div class="steps-header">
      <h2>Three steps to social proof</h2>
      <p>Set up in under 2 minutes. No code required.</p>
    </div>
    <div class="steps-grid">
      <div class="step">
        <div class="step-num">1</div>
        <h3>Create a Space</h3>
        <p>Name your product, customize the collection form, pick your brand color. Done in 30 seconds.</p>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <h3>Collect Testimonials</h3>
        <p>Share your unique collection link with customers. They fill out a beautiful form — you review and approve.</p>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <h3>Embed & Convert</h3>
        <p>Drop a single script tag on your site. A gorgeous wall of love appears. Visitors become customers.</p>
      </div>
    </div>
  </section>

  <section class="features" id="features">
    <div class="features-grid">
      <div class="feat"><div class="feat-icon">&#128279;</div><h3>Shareable Collection Link</h3><p>A beautiful form your customers will actually enjoy filling out. Custom questions, star ratings, brand colors.</p></div>
      <div class="feat"><div class="feat-icon">&#127912;</div><h3>Gorgeous Embed Widget</h3><p>Masonry wall, responsive layout. One script tag — looks native on any site. Dark mode support.</p></div>
      <div class="feat"><div class="feat-icon">&#9989;</div><h3>Approval Workflow</h3><p>Review every testimonial before it goes live. Approve, reject, or feature your best ones.</p></div>
      <div class="feat"><div class="feat-icon">&#9733;</div><h3>Star Ratings</h3><p>Collect and display 1-5 star ratings. Social proof that converts at a glance.</p></div>
      <div class="feat"><div class="feat-icon">&#128187;</div><h3>REST API</h3><p>Full programmatic access. Create spaces, manage testimonials, build custom integrations.</p></div>
      <div class="feat"><div class="feat-icon">&#128274;</div><h3>Powered-By Badge</h3><p>Every widget links back to Praised. Your customers become your marketing channel.</p></div>
    </div>
  </section>

  <section class="embed-section">
    <h2>One line of code</h2>
    <p>Copy, paste, done. The widget handles everything.</p>
    <div class="code">
      <span class="comment">&lt;!-- Add this where you want testimonials to appear --&gt;</span><br>
      <span class="tag">&lt;script</span> <span class="attr">src</span>=<span class="str">"${config.baseUrl}/widgets/embed/your-space.js"</span><span class="tag">&gt;&lt;/script&gt;</span>
    </div>
  </section>

  <section class="pricing" id="pricing">
    <div class="pricing-header">
      <h2>Simple pricing, serious value</h2>
      <p>Start free. Upgrade when your social proof takes off.</p>
    </div>
    <div class="pricing-grid">
      <div class="price-card">
        <h3>Free</h3>
        <div class="price-amt">$0<span>/mo</span></div>
        <div class="price-desc">Perfect for getting started.</div>
        <ul class="price-list">
          <li>1 space</li>
          <li>15 testimonials</li>
          <li>Embeddable widget</li>
          <li>Collection form</li>
          <li>Approval workflow</li>
        </ul>
        <a href="/api/auth/register" class="btn btn-outline">Get Started</a>
      </div>
      <div class="price-card pop">
        <div class="pop-badge">Most Popular</div>
        <h3>Pro</h3>
        <div class="price-amt">$19<span>/mo</span></div>
        <div class="price-desc">For growing businesses.</div>
        <ul class="price-list">
          <li>10 spaces</li>
          <li>Unlimited testimonials</li>
          <li>All widget styles</li>
          <li>Remove Praised branding</li>
          <li>Custom colors & fonts</li>
          <li>Priority support</li>
          <li>API access</li>
        </ul>
        <a href="/api/auth/register" class="btn btn-primary">Start Pro Trial</a>
      </div>
      <div class="price-card">
        <h3>Business</h3>
        <div class="price-amt">$49<span>/mo</span></div>
        <div class="price-desc">For teams and agencies.</div>
        <ul class="price-list">
          <li>Unlimited spaces</li>
          <li>Unlimited testimonials</li>
          <li>All Pro features</li>
          <li>Video testimonials</li>
          <li>Custom CSS</li>
          <li>Webhook integrations</li>
          <li>Team members</li>
        </ul>
        <a href="/api/auth/register" class="btn btn-outline">Contact Us</a>
      </div>
    </div>
  </section>

  <section class="cta">
    <h2>Your customers love you. Show it.</h2>
    <p>Start collecting testimonials in under 2 minutes. Free forever plan available.</p>
    <a href="/api/auth/register" class="btn btn-primary" style="padding:14px 32px;font-size:16px;">Start Collecting — Free</a>
  </section>

  <footer>&copy; ${new Date().getFullYear()} Praised. Social proof that converts.</footer>
</body>
</html>`;
}

function demoCard(name: string, title: string, company: string, color: string, rating: number, text: string): string {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < rating ? '#f59e0b' : '#e2e8f0'};">&#9733;</span>`
  ).join('');
  const subtitle = [title, company].filter(Boolean).join(' at ');
  const initial = name.charAt(0);

  return `<div class="t-card">
    <div class="t-stars">${stars}</div>
    <div class="t-text">${text}</div>
    <div class="t-author">
      <div class="t-avatar" style="background:${color};">${initial}</div>
      <div>
        <div class="t-name">${name}</div>
        ${subtitle ? `<div class="t-role">${subtitle}</div>` : ''}
      </div>
    </div>
  </div>`;
}
