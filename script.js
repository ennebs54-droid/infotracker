const TRACKING_DATA = {
  GDY234923: {
    status: 'Awaiting Custom Approval',
    courier: 'DPD UK',
    company: 'FedEx',
    location: 'Manchester Distribution Centre, Manchester, UK',
    estimatedDelivery: 'Pending Approval',
    latestUpdate: 'Shipment is awaiting custom approval before proceeding.',
    progress: ['Ordered', 'Confirmed'],
    timelineTemplate: [
      { hoursAgo: 1,  event: 'Awaiting Approval',     note: 'Shipment is awaiting custom approval before proceeding.' },
      { hoursAgo: 18, event: 'Arrived at facility',   note: 'Package arrived at Manchester customs facility.' },
      { hoursAgo: 26, event: 'Shipment processed',    note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: '42 Deansgate, Manchester, UK'
  },
  TRKBU372: {
    status: 'In Transit',
    courier: 'Global Express',
    company: 'FedEx Logistics',
    location: 'Manchester, UK',
    estimatedDelivery: 'May 14, 2026',
    latestUpdate: 'Package departed sort facility and is en route to distribution center.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timelineTemplate: [
      { hoursAgo: 2,  event: 'Departed sort facility', note: 'Package is in transit to regional hub. Estimated next step in 1h 30m to 3h.' },
      { hoursAgo: 20, event: 'Shipment picked up',     note: 'Pickup confirmed by courier partner.' },
      { hoursAgo: 28, event: 'Shipment processed',     note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: '48 Willowbrook Lane, Manchester, UK'
  },
  HDC284927: {
    status: 'Awaiting Custom Approval',
    courier: 'Global Express',
    company: 'Global Express',
    location: 'Manchester, UK',
    estimatedDelivery: 'Pending Approval',
    latestUpdate: 'Shipment is awaiting custom approval before proceeding.',
    progress: ['Ordered', 'Confirmed'],
    timelineTemplate: [
      { hoursAgo: 1,  event: 'Awaiting Approval',   note: 'Shipment is awaiting custom approval before proceeding.' },
      { hoursAgo: 15, event: 'Arrived at facility', note: 'Package arrived at Manchester customs facility.' },
      { hoursAgo: 24, event: 'Shipment processed',  note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: '48 Willowbrook Lane, Manchester, UK'
  },
  HFDBW2738: {
    status: 'Held for Receipt Confirmation',
    courier: 'UPS',
    company: 'UPS',
    location: 'Columbus, Ohio, USA',
    estimatedDelivery: null,
    latestUpdate: 'Package is held at facility pending receipt confirmation from recipient.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timelineTemplate: [
      { hoursAgo: 1,  event: 'Held for Receipt Confirmation', note: 'Package is held at the Ohio facility. Awaiting confirmation from recipient before delivery.' },
      { hoursAgo: 19, event: 'Arrived at facility',           note: 'Package arrived at Columbus, Ohio distribution center.' },
      { hoursAgo: 27, event: 'Shipment picked up',            note: 'Pickup confirmed by UPS courier.' }
    ],
    originAddress: 'Manchester, UK'
  },
  HBWK13843: {
    status: 'Awaiting Custom Fee Payment',
    courier: 'UPS',
    company: 'UPS',
    location: null,
    estimatedDelivery: null,
    latestUpdate: 'Package is held pending custom fee payment before it can be released for delivery.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timelineTemplate: [
      { hoursAgo: 0.1, event: 'Awaiting Custom Fee Payment', note: 'Package is held at the Ohio facility. Custom fee payment required before release.' },
      { hoursAgo: 3,   event: 'Arrived at Ohio facility',   note: 'Package arrived at Columbus, Ohio distribution center.' },
      { hoursAgo: 8,   event: 'Shipment picked up',         note: 'Pickup confirmed by UPS courier.' },
      { hoursAgo: 14,  event: 'Shipment processed',         note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: 'Columbus, Ohio, USA',
    useIpLocation: true,
    deliveryDays: 4
  },
    status: 'In Transit',
    courier: 'Global Express',
    company: 'Global Express',
    location: null,
    estimatedDelivery: null,
    latestUpdate: 'Package departed California facility and is en route to destination.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timelineTemplate: [
      { hoursAgo: 2,  event: 'Departed sort facility', note: 'Package left the California distribution center and is in transit.' },
      { hoursAgo: 21, event: 'Shipment picked up',     note: 'Pickup confirmed by Global Express courier.' },
      { hoursAgo: 29, event: 'Shipment processed',     note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: 'Los Angeles, California, USA',
    useIpLocation: true
  }
};

// ── Time helpers ──
function formatTime(date) {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${time}`;
}

function buildTimeline(template, anchorTime) {
  return template.map(entry => {
    const d = new Date(anchorTime - entry.hoursAgo * 60 * 60 * 1000);
    return { time: formatTime(d), event: entry.event, note: entry.note };
  });
}

function getDateInDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── Per-user localStorage persistence ──
function getUserData(trackingId) {
  try {
    const stored = localStorage.getItem('ts_' + trackingId);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function saveUserData(trackingId, data) {
  try {
    localStorage.setItem('ts_' + trackingId, JSON.stringify(data));
  } catch {}
}

// ── IP location ──
async function getIpLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const d = await res.json();
    if (d.country_code === 'US' && d.region) return d.region + ', USA';
    if (d.city && d.country_name) return d.city + ', ' + d.country_name;
    return null;
  } catch { return null; }
}

// ── DOM refs ──
const statusBadge         = document.getElementById('statusBadge');
const displayTracking     = document.getElementById('displayTracking');
const deliveryDate        = document.getElementById('deliveryDate');
const courierInfo         = document.getElementById('courierInfo');
const companyName         = document.getElementById('companyName');
const packageLocation     = document.getElementById('packageLocation');
const latestUpdate        = document.getElementById('latestUpdate');
const timelineList        = document.getElementById('timelineList');
const resultsSection      = document.getElementById('resultsSection');
const trackForm           = document.getElementById('track-form');
const trackingNumberInput = document.getElementById('trackingNumber');
const statusMessage       = document.getElementById('statusMessage');
const progressBar         = document.getElementById('progressBar');
const stepElements        = Array.from(document.querySelectorAll('.step'));
const shippedAddressField = document.getElementById('shippedAddress');

const statusStyles = {
  'Delivered':                   { background: '#2f9c69', text: '#ffffff' },
  'In Transit':                  { background: '#f39c12', text: '#ffffff' },
  'Processing':                  { background: '#5b5fd3', text: '#ffffff' },
  'Confirmed':                   { background: '#3498db', text: '#ffffff' },
  'Out for Delivery':            { background: '#f39c12', text: '#ffffff' },
  'Awaiting Custom Approval':    { background: '#9b59b6', text: '#ffffff' },
  'Held for Receipt Confirmation': { background: '#e67e22', text: '#ffffff' }
};

function setStatusBadge(status) {
  const style = statusStyles[status] || { background: '#5b5fd3', text: '#ffffff' };
  statusBadge.textContent = status;
  statusBadge.style.background = style.background;
  statusBadge.style.color = style.text;
}

function setProgress(progressSteps) {
  const completed = progressSteps.length;
  const total = stepElements.length;
  stepElements.forEach((stepEl, index) => {
    stepEl.classList.toggle('active', index < completed);
    stepEl.style.color = index < completed ? 'var(--text)' : 'var(--muted)';
    stepEl.querySelector('.step-dot').style.background = index < completed ? '#1ab6ff' : 'rgba(27,35,48,0.12)';
  });
  progressBar.style.width = `${Math.min((completed / total) * 100, 100)}%`;
}

function renderTimeline(entries) {
  timelineList.innerHTML = '';
  entries.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'timeline-item';
    li.innerHTML = `
      <span class="timeline-marker"></span>
      <div class="timeline-details">
        <p class="title">${entry.event}</p>
        <p class="meta">${entry.time} · ${entry.note}</p>
      </div>
    `;
    timelineList.appendChild(li);
  });
}

function showResult(data) {
  displayTracking.textContent = data.trackingId;
  deliveryDate.textContent = data.estimatedDelivery;
  courierInfo.textContent = data.courier;
  companyName.textContent = data.company;
  packageLocation.textContent = data.location;
  shippedAddressField.innerHTML = data.originAddress.replace(/, /g, '<br>');
  latestUpdate.textContent = data.latestUpdate;
  setStatusBadge(data.status);
  setProgress(data.progress);
  renderTimeline(data.timeline);
  resultsSection.classList.remove('hidden');
}

function showError(message) {
  statusMessage.textContent = message;
  resultsSection.classList.add('hidden');
}

trackForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusMessage.textContent = '';
  const cleaned = trackingNumberInput.value.trim().toUpperCase();

  if (!cleaned) { showError('Please enter a tracking number'); return; }

  const base = TRACKING_DATA[cleaned];
  if (!base) { showError('Tracking number not found'); return; }

  // Return saved user-specific data if it exists
  const saved = getUserData(cleaned);
  if (saved) { showResult(saved); return; }

  // First time — build personalised snapshot
  const now = Date.now();
  const resolved = {
    trackingId: cleaned,
    status: base.status,
    courier: base.courier,
    company: base.company,
    location: base.location,
    estimatedDelivery: base.estimatedDelivery || getDateInDays(base.deliveryDays || 2),
    latestUpdate: base.latestUpdate,
    progress: base.progress,
    originAddress: base.originAddress,
    timeline: buildTimeline(base.timelineTemplate, now)
  };

  if (base.useIpLocation) {
    const loc = await getIpLocation();
    resolved.location = loc || 'United States';
  }

  saveUserData(cleaned, resolved);
  showResult(resolved);
});

trackingNumberInput.addEventListener('input', () => {
  if (statusMessage.textContent) statusMessage.textContent = '';
});
