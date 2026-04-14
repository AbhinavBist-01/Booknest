/* login.js */

function toast(msg, type = 'success') {
  const area = document.getElementById('toastArea');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  area.appendChild(el);
  setTimeout(() => el.remove(), 3100);
}

function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn._label = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._label;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('btnLogin');
  setLoading(btn, true);

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (typeof data.error === 'string') throw new Error(data.error);
      const issues = Array.isArray(data.error) ? data.error.map(i => i.message).join(', ') : '';
      throw new Error(issues || data.message || 'Login failed');
    }
    toast('Signed in! Redirecting…', 'success');
    setTimeout(() => location.href = '/ui/booking.html', 1000);
  } catch (err) {
    toast(err.message, 'error');
    setLoading(btn, false);
  }
}
