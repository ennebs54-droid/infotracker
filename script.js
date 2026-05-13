const VALID_TRACKING_NUMBER = 'TRKBU372';

const BASE_TRACKING_DATA = {
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
  }
};

const STORAGE_KEY = 'tracking-dashboard-overrides';

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

function loadOverrides() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function getTrackingData() {
  // This is now handled by the server, but for fallback, we can keep base data
  return BASE_TRACKING_DATA;
}

function setStatusBadge(status) {
  const style = statusStyles[status] || statusStyles['In Transit'];
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
  const percent = Math.min((completed / total) * 100, 100);
  progressBar.style.width = `${percent}%`;
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
  shippedAddressField.innerHTML = (data.originAddress || '48 Willowbrook Lane<br>Manchester,<br>UK').replace(/, /g, '<br>');
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

function clearError() {
  statusMessage.textContent = '';
}

trackForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearError();
  const cleaned = trackingNumberInput.value.trim().toUpperCase();
  if (cleaned !== VALID_TRACKING_NUMBER) {
    showError('Invalid Tracking Number');
    return;
  }
  clearError();
  showResult(BASE_TRACKING_DATA[VALID_TRACKING_NUMBER], VALID_TRACKING_NUMBER);
});

trackingNumberInput.addEventListener('input', () => {
  if (statusMessage.textContent) {
    clearError();
  }
});

window.addEventListener('load', () => {
  trackingNumberInput.value = '';
  lucide.replace();
});
