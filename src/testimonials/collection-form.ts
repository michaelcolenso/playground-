import { config } from '../config';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function renderCollectionForm(space: any): string {
  const color = escapeHtml(space.brand_color || '#6366f1');
  const name = escapeHtml(space.name);
  const message = escapeHtml(space.custom_message);
  const prompt = escapeHtml(space.question_prompt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Share Your Experience — ${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .card {
      background: white; border-radius: 20px; padding: 40px;
      max-width: 520px; width: 100%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.06);
    }
    .logo-area { text-align: center; margin-bottom: 24px; }
    .logo-area h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .logo-area p { color: #64748b; font-size: 15px; line-height: 1.5; }
    .prompt { font-weight: 600; color: #0f172a; margin-bottom: 16px; font-size: 15px; }

    .stars { display: flex; gap: 6px; margin-bottom: 20px; justify-content: center; }
    .star {
      font-size: 32px; cursor: pointer; transition: transform 0.15s;
      color: #e2e8f0; user-select: none;
    }
    .star:hover { transform: scale(1.2); }
    .star.active { color: #f59e0b; }

    label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 5px; }
    input, textarea {
      width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
      font-size: 15px; font-family: inherit; margin-bottom: 14px; transition: border-color 0.15s;
      background: #f8fafc; color: #0f172a;
    }
    input:focus, textarea:focus { outline: none; border-color: ${color}; background: white; }
    textarea { resize: vertical; min-height: 100px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .submit-btn {
      width: 100%; padding: 13px; background: ${color}; color: white; border: none;
      border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s, transform 0.1s; margin-top: 4px;
    }
    .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .submit-btn:active { transform: translateY(0); }

    .powered {
      text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;
    }
    .powered a { color: #94a3b8; text-decoration: none; font-weight: 500; }
    .powered a:hover { color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-area">
      ${space.logo_url ? `<img src="${escapeHtml(space.logo_url)}" alt="" style="height:40px;margin-bottom:12px;">` : ''}
      <h1>${name}</h1>
      <p>${message}</p>
    </div>

    <form method="POST" action="/api/testimonials/collect/${escapeHtml(space.slug)}">
      <p class="prompt">${prompt}</p>

      ${space.collect_rating ? `
      <div class="stars" id="stars">
        <span class="star active" data-v="1">&#9733;</span>
        <span class="star active" data-v="2">&#9733;</span>
        <span class="star active" data-v="3">&#9733;</span>
        <span class="star active" data-v="4">&#9733;</span>
        <span class="star active" data-v="5">&#9733;</span>
      </div>
      <input type="hidden" name="rating" id="rating" value="5">
      ` : ''}

      <label for="content">Your testimonial *</label>
      <textarea name="content" id="content" placeholder="Share your experience..." required></textarea>

      <label for="authorName">Your name *</label>
      <input type="text" name="authorName" id="authorName" placeholder="Jane Smith" required>

      <div class="row">
        <div>
          <label for="authorTitle">Title / Role</label>
          <input type="text" name="authorTitle" id="authorTitle" placeholder="CEO">
        </div>
        ${space.collect_company ? `
        <div>
          <label for="authorCompany">Company</label>
          <input type="text" name="authorCompany" id="authorCompany" placeholder="Acme Inc">
        </div>
        ` : '<div></div>'}
      </div>

      <label for="authorEmail">Email (not displayed)</label>
      <input type="email" name="authorEmail" id="authorEmail" placeholder="jane@example.com">

      <button type="submit" class="submit-btn">Submit Testimonial</button>
    </form>

    <div class="powered">
      Powered by <a href="${config.baseUrl}"><strong>Praised</strong></a>
    </div>
  </div>

  <script>
    document.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.v);
        document.getElementById('rating').value = val;
        document.querySelectorAll('.star').forEach(s => {
          s.classList.toggle('active', parseInt(s.dataset.v) <= val);
        });
      });
    });
  </script>
</body>
</html>`;
}

export function renderThankYou(space: any): string {
  const color = escapeHtml(space.brand_color || '#6366f1');
  const name = escapeHtml(space.name);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You! — ${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
    }
    .card {
      background: white; border-radius: 20px; padding: 48px;
      max-width: 440px; width: 100%; text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.06);
    }
    .emoji { font-size: 56px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    p { color: #64748b; font-size: 15px; line-height: 1.6; }
    .powered { margin-top: 24px; font-size: 12px; color: #94a3b8; }
    .powered a { color: #94a3b8; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">&#10024;</div>
    <h1>Thank you!</h1>
    <p>Your testimonial for <strong>${name}</strong> has been submitted. It will appear once it's been reviewed.</p>
    <div class="powered">
      Powered by <a href="${config.baseUrl}"><strong>Praised</strong></a>
    </div>
  </div>
</body>
</html>`;
}
