import { config } from '../config';

export function renderDocsPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation — Praised</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafbfe;color:#0f172a;line-height:1.6;}
    .container{max-width:780px;margin:0 auto;padding:40px 24px;}
    nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;}
    .logo{font-size:20px;font-weight:800;color:#0f172a;text-decoration:none;display:flex;align-items:center;gap:6px;}
    h1{font-size:32px;font-weight:800;margin-bottom:6px;}
    .subtitle{color:#64748b;font-size:15px;margin-bottom:32px;}
    h2{font-size:20px;font-weight:700;margin:36px 0 10px;padding-top:20px;border-top:1px solid #e8ecf4;}
    h3{font-size:15px;font-weight:600;margin:20px 0 6px;color:#6366f1;}
    p{color:#64748b;margin-bottom:10px;font-size:14px;}
    code{background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:13px;font-family:'SF Mono',monospace;}
    pre{background:#0f172a;border-radius:10px;padding:16px;overflow-x:auto;margin:10px 0 16px;font-family:'SF Mono',monospace;font-size:13px;line-height:1.7;color:#e2e8f0;}
    .method{display:inline-block;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700;margin-right:6px;}
    .m-get{background:rgba(16,185,129,.12);color:#10b981;}
    .m-post{background:rgba(99,102,241,.12);color:#6366f1;}
    .m-put{background:rgba(245,158,11,.12);color:#f59e0b;}
    .m-patch{background:rgba(168,85,247,.12);color:#a855f7;}
    .m-delete{background:rgba(239,68,68,.12);color:#ef4444;}
    .ep{font-family:'SF Mono',monospace;font-size:14px;font-weight:500;}
    table{width:100%;border-collapse:collapse;margin:10px 0 16px;}
    th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e8ecf4;font-size:13px;}
    th{color:#64748b;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}
    .note{background:rgba(99,102,241,.05);border-left:3px solid #6366f1;padding:10px 14px;border-radius:0 8px 8px 0;margin:14px 0;}
    .note p{color:#475569;margin:0;}
  </style>
</head>
<body>
  <div class="container">
    <nav>
      <a href="/" class="logo">&#10024; Praised</a>
      <a href="/" style="color:#64748b;font-size:14px;">Back to Home</a>
    </nav>

    <h1>API Documentation</h1>
    <p class="subtitle">Base URL: <code>${config.baseUrl}/api</code></p>

    <h2>Authentication</h2>
    <p>Authenticate with a JWT token or API key:</p>
    <pre>Authorization: Bearer &lt;jwt-token&gt;
// or
X-API-Key: pr_your_api_key</pre>

    <h3><span class="method m-post">POST</span> <span class="ep">/auth/register</span></h3>
    <p>Create a new account.</p>
    <pre>{ "name": "Jane", "email": "jane@example.com", "password": "securepass123" }

// Response: { "user": { "id", "email", "name", "plan", "apiKey" }, "token" }</pre>

    <h3><span class="method m-post">POST</span> <span class="ep">/auth/login</span></h3>
    <p>Get a JWT token.</p>
    <pre>{ "email": "jane@example.com", "password": "securepass123" }</pre>

    <h3><span class="method m-get">GET</span> <span class="ep">/auth/me</span></h3>
    <p>Get the authenticated user's profile.</p>

    <h2>Spaces</h2>
    <p>Spaces are projects/products that contain testimonials.</p>

    <h3><span class="method m-get">GET</span> <span class="ep">/spaces</span></h3>
    <p>List all your spaces with testimonial counts.</p>

    <h3><span class="method m-post">POST</span> <span class="ep">/spaces</span></h3>
    <p>Create a new space.</p>
    <table>
      <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
      <tr><td><code>name</code></td><td>string</td><td>Yes</td><td>Product name</td></tr>
      <tr><td><code>slug</code></td><td>string</td><td>Yes</td><td>URL slug (lowercase, hyphens)</td></tr>
      <tr><td><code>websiteUrl</code></td><td>string</td><td>No</td><td>Your product URL</td></tr>
      <tr><td><code>brandColor</code></td><td>string</td><td>No</td><td>Hex color (default: #6366f1)</td></tr>
      <tr><td><code>customMessage</code></td><td>string</td><td>No</td><td>Message shown on collection form</td></tr>
      <tr><td><code>questionPrompt</code></td><td>string</td><td>No</td><td>Question asked on form</td></tr>
    </table>

    <h3><span class="method m-put">PUT</span> <span class="ep">/spaces/:id</span></h3>
    <p>Update a space. All fields optional.</p>

    <h3><span class="method m-delete">DELETE</span> <span class="ep">/spaces/:id</span></h3>
    <p>Delete a space and all its testimonials.</p>

    <h2>Testimonials</h2>

    <h3><span class="method m-get">GET</span> <span class="ep">/testimonials/space/:spaceId</span></h3>
    <p>List testimonials. Filter with <code>?status=pending|approved|rejected</code></p>

    <h3><span class="method m-post">POST</span> <span class="ep">/testimonials</span></h3>
    <p>Create a testimonial via API (auto-approved).</p>
    <pre>{
  "spaceId": "...",
  "authorName": "Jane Smith",
  "authorTitle": "CEO",
  "authorCompany": "Acme",
  "content": "Amazing product!",
  "rating": 5
}</pre>

    <h3><span class="method m-patch">PATCH</span> <span class="ep">/testimonials/:id</span></h3>
    <p>Approve, reject, or feature a testimonial.</p>
    <pre>{ "status": "approved", "isFeatured": true }</pre>

    <h3><span class="method m-delete">DELETE</span> <span class="ep">/testimonials/:id</span></h3>
    <p>Delete a testimonial.</p>

    <h2>Public Endpoints (No Auth)</h2>

    <h3><span class="method m-get">GET</span> <span class="ep">/testimonials/collect/:slug</span></h3>
    <p>Renders the public collection form. Share this link with customers!</p>

    <h3><span class="method m-post">POST</span> <span class="ep">/testimonials/collect/:slug</span></h3>
    <p>Submit a testimonial (form or JSON). Status is set to <code>pending</code>.</p>

    <h2>Widget / Embed</h2>

    <h3><span class="method m-get">GET</span> <span class="ep">/widgets/embed/:slug.js</span></h3>
    <p>Embeddable JavaScript widget. Add to any page:</p>
    <pre>&lt;script src="${config.baseUrl}/widgets/embed/your-space.js"&gt;&lt;/script&gt;</pre>

    <h3><span class="method m-get">GET</span> <span class="ep">/widgets/wall/:slug</span></h3>
    <p>Full-page wall of love. Can be used in an iframe.</p>

    <h3><span class="method m-get">GET</span> <span class="ep">/widgets/api/:slug</span></h3>
    <p>JSON endpoint for approved testimonials. Build your own display.</p>

    <div class="note">
      <p><strong>Embed code tip:</strong> The script auto-creates a container and renders a responsive masonry grid. It also adjusts columns based on container width. Works on any site.</p>
    </div>

    <h2>Billing</h2>
    <h3><span class="method m-get">GET</span> <span class="ep">/billing</span></h3>
    <p>Get plan info, usage, and available plans.</p>

    <h3><span class="method m-post">POST</span> <span class="ep">/billing/checkout</span></h3>
    <p>Create a Stripe checkout session: <code>{ "plan": "pro" }</code></p>
  </div>
</body>
</html>`;
}
