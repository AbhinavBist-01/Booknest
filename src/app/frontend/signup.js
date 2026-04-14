/* signup.js — handles both sign-in and sign-up tabs */

// ── Toast helper ─────────────────────────────────────────────
function toast(msg, type = 'success') {
  const area = document.getElementById('toastArea');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  area.appendChild(el);
  setTimeout(() => el.remove(), 3100);
}

// ── Loading state helper ─────────────────────────────────────
function setLoading(btn, loading, label = btn.textContent) {
  if (loading) {
    btn.disabled = true;
    btn._label = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._label || label;
  }
}

// ── Tab switching ────────────────────────────────────────────
function switchTab(tab) {
  const isSignin = tab === 'signin';
  document.getElementById('tabSignin').classList.toggle('active', isSignin);
  document.getElementById('tabSignup').classList.toggle('active', !isSignin);
  document.getElementById('formSignin').classList.toggle('hidden', !isSignin);
  document.getElementById('formSignup').classList.toggle('hidden', isSignin);
  document.getElementById('authTitle').textContent = isSignin ? 'Welcome back' : 'Create account';
  document.getElementById('authSubtitle').textContent = isSignin
    ? 'Sign in to book your seats'
    : 'Join Booknest in seconds';
}

// ── Sign Up handler ──────────────────────────────────────────
async function handleSignup(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSignup');
  setLoading(btn, true);

  const firstName = document.getElementById('suFirst').value.trim();
  const lastName  = document.getElementById('suLast').value.trim();
  const email     = document.getElementById('suEmail').value.trim();
  const password  = document.getElementById('suPassword').value;

  try {
    const res = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const issues = Array.isArray(data.error) ? data.error.map(i => i.message).join(', ') : '';
      throw new Error(issues || data.message || 'Signup failed');
    }
    toast('Account created! Redirecting…', 'success');
    setTimeout(() => location.href = '/ui/booking.html', 1000);
  } catch (err) {
    toast(err.message, 'error');
    setLoading(btn, false);
  }
}

// ── Sign In handler ──────────────────────────────────────────
async function handleSignin(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSignin');
  setLoading(btn, true);

  const email    = document.getElementById('siEmail').value.trim();
  const password = document.getElementById('siPassword').value;

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Login failed');
    toast('Welcome back! Redirecting…', 'success');
    setTimeout(() => location.href = '/ui/booking.html', 1000);
  } catch (err) {
    toast(err.message, 'error');
    setLoading(btn, false);
  }
}

// Start on Sign Up tab
switchTab('signup');
