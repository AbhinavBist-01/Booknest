/* booking.js — Seat selection + booking logic */

// ── Toast ─────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const area = document.getElementById('toastArea');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  area.appendChild(el);
  setTimeout(() => el.remove(), 3100);
}

// ── Seat Data ─────────────────────────────────────────────────
// Format: { id, row, num, section, price, booked }
const SECTIONS = {
  premium:  { rows: ['A','B'],          cols: 12, price: 500,  gridId: 'gridPremium'  },
  standard: { rows: ['C','D','E','F'],  cols: 14, price: 300,  gridId: 'gridStandard' },
  economy:  { rows: ['G','H','I','J'],  cols: 16, price: 150,  gridId: 'gridEconomy'  },
};

// Pre-booked seats (realistic scatter)
const PREBOOKED = new Set([
  'A3','A5','A9','A10',
  'B2','B6','B7','B11',
  'C1','C4','C8','C13','C14',
  'D3','D5','D6','D9','D10','D12',
  'E2','E7','E11','E14',
  'F1','F4','F8','F13',
  'G3','G6','G10','G14','G15',
  'H2','H5','H9','H12','H16',
  'I1','I4','I7','I11','I14',
  'J3','J6','J8','J12','J15','J16',
]);

let selectedSeats = new Set(); // { e.g. 'A3' }
let seatMeta = {};             // seatId → { section, price }

// ── Build seat grids ─────────────────────────────────────────
function buildGrids() {
  for (const [sectionKey, cfg] of Object.entries(SECTIONS)) {
    const grid = document.getElementById(cfg.gridId);
    grid.innerHTML = '';

    for (const row of cfg.rows) {
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';

      // Row label
      const label = document.createElement('div');
      label.className = 'seat-row-label';
      label.textContent = row;
      rowEl.appendChild(label);

      // Left block
      const half = Math.floor(cfg.cols / 2);
      for (let n = 1; n <= cfg.cols; n++) {
        if (n === half + 1) {
          const gap = document.createElement('div');
          gap.className = 'seat-gap';
          rowEl.appendChild(gap);
        }

        const seatId = `${row}${n}`;
        const booked = PREBOOKED.has(seatId);
        seatMeta[seatId] = { section: sectionKey, price: cfg.price };

        const seat = document.createElement('div');
        seat.className = 'seat' + (booked ? ' booked' : '');
        seat.dataset.id = seatId;
        seat.title = booked ? `${seatId} — Booked` : `${seatId} — ₹${cfg.price}`;

        if (!booked) seat.addEventListener('click', () => toggleSeat(seatId, seat));
        rowEl.appendChild(seat);
      }

      grid.appendChild(rowEl);
    }
  }
  updateSeatsLeft();
}

// ── Toggle seat selection ────────────────────────────────────
function toggleSeat(id, el) {
  if (selectedSeats.has(id)) {
    selectedSeats.delete(id);
    el.classList.remove('selected');
  } else {
    if (selectedSeats.size >= 8) {
      toast('Maximum 8 seats per booking', 'error');
      return;
    }
    selectedSeats.add(id);
    el.classList.add('selected');
  }
  updateSummary();
}

// ── Update summary panel ─────────────────────────────────────
function updateSummary() {
  const confirmBtn = document.getElementById('btnConfirm');

  if (selectedSeats.size === 0) {
    document.getElementById('sumSeats').textContent = 'None';
    document.getElementById('sumPrice').textContent = '—';
    document.getElementById('sumFee').textContent   = '—';
    document.getElementById('sumTotal').textContent  = '—';
    confirmBtn.disabled = true;
    return;
  }

  const seats = [...selectedSeats].sort();
  let subtotal = 0;
  for (const id of seats) subtotal += seatMeta[id]?.price ?? 0;
  const fee   = Math.round(subtotal * 0.05);
  const total = subtotal + fee;

  document.getElementById('sumSeats').textContent = seats.join(', ');
  document.getElementById('sumPrice').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById('sumFee').textContent   = `₹${fee.toLocaleString('en-IN')}`;
  document.getElementById('sumTotal').textContent  = `₹${total.toLocaleString('en-IN')}`;
  confirmBtn.disabled = false;
}

// ── Seats-left counter ───────────────────────────────────────
function updateSeatsLeft() {
  let total = 0;
  for (const cfg of Object.values(SECTIONS)) total += cfg.rows.length * cfg.cols;
  const left = total - PREBOOKED.size;
  document.getElementById('seatsLeft').textContent = `${left} seats left`;
}

// ── Auth / user info ─────────────────────────────────────────
async function loadUser() {
  try {
    const res = await fetch('/auth/me', { credentials: 'include' });
    if (!res.ok) throw new Error('not authed');
    const data = await res.json();
    const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email || 'User';
    document.getElementById('userName').textContent = name;
    document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
  } catch {
    // Fallback for demo mode (no backend)
    document.getElementById('userName').textContent = 'Demo User';
    document.getElementById('userAvatar').textContent = 'D';
  }
}

// ── Logout ────────────────────────────────────────────────────
document.getElementById('btnLogout').addEventListener('click', async () => {
  try {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {}
  location.href = '/ui/signup.html';
});

// ── Confirm booking ──────────────────────────────────────────
document.getElementById('btnConfirm').addEventListener('click', async () => {
  if (selectedSeats.size === 0) return;

  const btn = document.getElementById('btnConfirm');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Booking…`;

  const seats = [...selectedSeats].sort();

  try {
    // Attempt real API
    const res = await fetch('/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ seats }),
    });
    if (!res.ok) throw new Error('api');
  } catch {
    // Graceful demo fallback — still show confirmation
  }

  // Mark seats as booked visually
  for (const id of seats) {
    PREBOOKED.add(id);
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.classList.remove('selected');
      el.classList.add('booked');
      el.replaceWith(el.cloneNode(true)); // remove listeners
    }
  }
  selectedSeats.clear();
  updateSummary();
  updateSeatsLeft();
  showConfirm(seats);
  btn.innerHTML = 'Confirm Booking';
});

// ── Confirmation overlay ─────────────────────────────────────
function showConfirm(seats) {
  const overlay  = document.getElementById('confirmOverlay');
  const seatsDiv = document.getElementById('confirmSeats');
  const msg      = document.getElementById('confirmMsg');

  seatsDiv.innerHTML = seats.map(s => `<span class="seat-tag">${s}</span>`).join('');
  msg.textContent = `Seats ${seats.join(', ')} reserved for Interstellar — IMAX Hall 1 at 7:30 PM. Enjoy the show!`;
  overlay.classList.remove('hidden');
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.add('hidden');
}

// ── Init ──────────────────────────────────────────────────────
buildGrids();
loadUser();
