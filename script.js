const TRACKING_DATA = {
  GDY234923: {
    status: 'Awaiting Custom Approval',
    courier: 'DPD UK',
    company: 'FedEx',
    location: 'Manchester Distribution Centre, Manchester, UK',
    estimatedDelivery: 'Pending Approval',
    latestUpdate: 'Shipment is awaiting custom approval before proceeding.',
    progress: ['Ordered', 'Confirmed'],
    timeline: [
      { time: 'Today, 10:00 AM', event: 'Awaiting Approval', note: 'Shipment is awaiting custom approval before proceeding.' }
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
    timeline: [
      { time: 'Today, 10:24 AM', event: 'Departed sort facility', note: 'Package is in transit to regional hub. Estimated next step in 1h 30m to 3h.' },
      { time: 'Yesterday, 7:12 PM', event: 'Shipment picked up', note: 'Pickup confirmed by courier partner.' },
      { time: 'Yesterday, 8:00 AM', event: 'Shipment processed', note: 'Shipment has entered the carrier network.' }
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
    timeline: [
      { time: 'Today, 10:00 AM', event: 'Awaiting Approval', note: 'Shipment is awaiting custom approval before proceeding.' }
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
    timeline: [
      { time: 'Today, 8:30 AM', event: 'Held for Receipt Confirmation', note: 'Package is held at the Ohio facility. Awaiting confirmation from recipient before delivery.' },
      { time: 'Yesterday, 5:15 PM', event: 'Arrived at facility', note: 'Package arrived at Columbus, Ohio distribution center.' },
      { time: 'Yesterday, 10:00 AM', event: 'Shipment picked up', note: 'Pickup confirmed by UPS courier.' }
    ],
    originAddress: 'Manchester, UK'
  },
  DGW36964: {
    status: 'In Transit',
    courier: 'Global Express',
    company: 'Global Express',
    location: null,
    estimatedDelivery: null,
    latestUpdate: 'Package departed California facility and is en route to destination.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timeline: [
      { time: 'Today, 9:45 AM', event: 'Departed sort facility', note: 'Package left the California distribution center and is in transit.' },
      { time: 'Yesterday, 6:30 PM', event: 'Shipment picked up', note: 'Pickup confirmed by Global Express courier.' },
      { time: 'Yesterday, 9:00 AM', event: 'Shipment processed', note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: 'Los Angeles, California, USA',
    useIpLocation: true
  },
  OHIO456789: {
    status: 'In Transit',
    courier: 'Express Logistics',
    company: 'Express Logistics',
    location: null,
    estimatedDelivery: null,
    latestUpdate: 'Package is in transit to your location.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timeline: [
      { time: 'Today, 12:00 PM', event: 'Departed Ohio facility', note: 'Package left the Ohio distribution center and is en route to your location.' },
      { time: 'Today, 8:30 AM', event: 'Shipment picked up', note: 'Pickup confirmed by Express Logistics courier.' },
      { time: 'Yesterday, 6:00 PM', event: 'Shipment processed', note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: 'Columbus, Ohio, USA',
    useIpLocation: true
  },
  YEJ472822: {
    status: 'In Transit',
    courier: 'Express Logistics',
    company: 'Express Logistics',
    location: null,
    estimatedDelivery: null,
    latestUpdate: 'Package is moving through the Ohio region and is on its way to your location.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timeline: [
      { time: 'Today, 1:15 PM', event: 'Departed Ohio facility', note: 'Package left the Ohio distribution center and is en route to your location.' },
      { time: 'Today, 9:40 AM', event: 'Shipment picked up', note: 'Pickup confirmed by Express Logistics courier.' },
      { time: 'Yesterday, 7:00 PM', event: 'Shipment processed', note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: 'Cleveland, Ohio, USA',
    useIpLocation: true
  }
};

async function getIpLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const d = await res.json();
    if (d.country_code === 'US' && d.region) return d.region + ', USA';
    if (d.city && d.country_name) return d.city + ', ' + d.country_name;
    return null;
  } catch { return null; }
}

function getDateInDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const statusBadge = document.getElementById('statusBadge');
const displayTracking = document.getElementById('displayTracking');
const deliveryDate = document.getElementById('deliveryDate');
const courierInfo = document.getElementById('courierInfo');
const companyName = document.getElementById('companyName');
const packageLocation = document.getElementById('packageLocation');
const latestUpdate = document.getElementById('latestUpdate');
const timelineList = document.getElementById('timelineList');
const resultsSection = document.getElementById('resultsSection');
const trackForm = document.getElementById('track-form');
const trackingNumberInput = document.getElementById('trackingNumber');
const statusMessage = document.getElementById('statusMessage');
const progressBar = document.getElementById('progressBar');
const stepElements = Array.from(document.querySelectorAll('.step'));
const shippedAddressField = document.getElementById('shippedAddress');

const statusStyles = {
  Delivered: { background: '#2f9c69', text: '#ffffff' },
  'In Transit': { background: '#f39c12', text: '#ffffff' },
  Processing: { background: '#5b5fd3', text: '#ffffff' },
  Confirmed: { background: '#3498db', text: '#ffffff' },
  'Out for Delivery': { background: '#f39c12', text: '#ffffff' }
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
    if (index < completed) {
      stepEl.classList.add('active');
      stepEl.style.color = 'var(--text)';
    } else {
      stepEl.classList.remove('active');
      stepEl.style.color = 'var(--muted)';
    }
    stepEl.querySelector('.step-dot').style.background = index < completed ? '#1ab6ff' : 'rgba(27, 35, 48, 0.12)';
  });
  progressBar.style.width = `${Math.min((completed / total) * 100, 100)}%`;
}

function renderTimeline(entries) {
  timelineList.innerHTML = '';
  entries.forEach((entry) => {
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

function showResult(data, trackingKey) {
  displayTracking.textContent = trackingKey;
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

  if (!cleaned) {
    showError('Please enter a tracking number');
    return;
  }

  const data = TRACKING_DATA[cleaned];
  if (!data) {
    showError('Tracking number not found');
    return;
  }

  const resolved = Object.assign({}, data);

  if (data.useIpLocation) {
    const loc = await getIpLocation();
    resolved.location = loc || 'United States';
  }

  if (!data.estimatedDelivery) {
    resolved.estimatedDelivery = getDateInDays(2);
  }

  showResult(resolved, cleaned);
});

trackingNumberInput.addEventListener('input', () => {
  if (statusMessage.textContent) statusMessage.textContent = '';
});
