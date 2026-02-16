import { config } from '../config';

function baseStyles(): string {
  return `
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}
    .card{background:#fff;border-radius:20px;padding:40px;max-width:420px;width:100%;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 20px 60px rgba(0,0,0,0.06);}
    .logo{text-align:center;font-size:20px;font-weight:800;margin-bottom:8px;}
    .subtitle{text-align:center;color:#64748b;font-size:15px;margin-bottom:28px;}
    label{display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:5px;}
    input{width:100%;padding:11px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:15px;font-family:inherit;margin-bottom:14px;background:#f8fafc;color:#0f172a;}
    input:focus{outline:none;border-color:#6366f1;background:#fff;}
    .btn{width:100%;padding:13px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-top:4px;}
    .btn:hover{background:#818cf8;}
    .btn:disabled{opacity:.6;cursor:not-allowed;}
    .error{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:14px;display:none;}
    .link{text-align:center;margin-top:20px;font-size:14px;color:#64748b;}
    .link a{color:#6366f1;font-weight:500;text-decoration:none;}
    .link a:hover{text-decoration:underline;}
  `;
}

export function renderRegisterPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign Up — Praised</title>
  <style>${baseStyles()}</style>
</head>
<body>
  <div class="card">
    <div class="logo">&#10024; Praised</div>
    <div class="subtitle">Start collecting testimonials for free</div>
    <div class="error" id="error"></div>
    <form id="form">
      <label for="name">Your name</label>
      <input type="text" id="name" name="name" placeholder="Jane Smith" required>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" placeholder="jane@example.com" required>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" placeholder="At least 8 characters" minlength="8" required>
      <button type="submit" class="btn" id="submitBtn">Create Account</button>
    </form>
    <div class="link">Already have an account? <a href="/login">Log in</a></div>
  </div>
  <script>
    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const err = document.getElementById('error');
      btn.disabled = true;
      btn.textContent = 'Creating account...';
      err.style.display = 'none';
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        localStorage.setItem('praised_token', data.token);
        localStorage.setItem('praised_user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } catch (e) {
        err.textContent = e.message;
        err.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  </script>
</body>
</html>`;
}

export function renderLoginPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Log In — Praised</title>
  <style>${baseStyles()}</style>
</head>
<body>
  <div class="card">
    <div class="logo">&#10024; Praised</div>
    <div class="subtitle">Welcome back</div>
    <div class="error" id="error"></div>
    <form id="form">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" placeholder="jane@example.com" required>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" placeholder="Your password" required>
      <button type="submit" class="btn" id="submitBtn">Log In</button>
    </form>
    <div class="link">No account yet? <a href="/register">Sign up free</a></div>
  </div>
  <script>
    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const err = document.getElementById('error');
      btn.disabled = true;
      btn.textContent = 'Logging in...';
      err.style.display = 'none';
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        localStorage.setItem('praised_token', data.token);
        localStorage.setItem('praised_user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } catch (e) {
        err.textContent = e.message;
        err.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Log In';
      }
    });
  </script>
</body>
</html>`;
}
