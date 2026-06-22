// Fallback data for tracking
const BASE_TRACKING_DATA = {
  GDY234923: {
    status: 'Awaiting Custom Approval',
    courier: 'Global Express',
    company: 'FedEx',
    location: 'Manchester, UK',
    estimatedDelivery: 'Pending Approval',
    latestUpdate: 'Shipment is awaiting custom approval before proceeding.',
    progress: ['Ordered', 'Confirmed'],
    timeline: [
      { time: 'Today, 10:00 AM', event: 'Awaiting Approval', note: 'Shipment is awaiting custom approval before proceeding.' }
    ],
    originAddress: 'Custom Shipment'
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
  }
};

const STORAGE_KEY = 'tracking-data';

// Auto-initialize sample data if localStorage is empty
function initializeSampleDataIfNeeded() {
  // Always clear old tracking data and reinitialize to ensure fresh state
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('tracking-data-')) {
      localStorage.removeItem(key);
    }
  });

  const sampleData = {
    'GDY234923': {
      status: 'Awaiting Custom Approval',
      courier: 'Custom Logistics',
      company: 'Custom Handler',
      location: 'Pending Location',
      estimatedDelivery: 'Pending Approval',
      latestUpdate: 'Shipment is awaiting custom approval before proceeding.',
      originAddress: 'Custom Shipment',
      progress: ['Ordered', 'Confirmed'],
      timeline: [
        { time: 'Today, 10:00 AM', event: 'Awaiting Approval', note: 'Shipment is awaiting custom approval before proceeding.' }
      ]
    },
    'TRKBU372': {
      status: 'In Transit',
      courier: 'Global Express',
      company: 'FedEx Logistics',
      location: 'Manchester, UK',
      estimatedDelivery: 'May 14, 2026',
      latestUpdate: 'Package departed sort facility and is en route to distribution center.',
      originAddress: '48 Willowbrook Lane, Manchester, UK',
      progress: ['Ordered', 'Confirmed', 'Shipped'],
      timeline: [
        { time: 'Today, 10:24 AM', event: 'Departed sort facility', note: 'Package is in transit to regional hub. Estimated next step in 1h 30m to 3h.' },
        { time: 'Yesterday, 7:12 PM', event: 'Shipment picked up', note: 'Pickup confirmed by courier partner.' },
        { time: 'Yesterday, 8:00 AM', event: 'Shipment processed', note: 'Shipment has entered the carrier network.' }
      ]
    }
  };
  
  Object.entries(sampleData).forEach(([id, data]) => {
    localStorage.setItem(`${STORAGE_KEY}-${id}`, JSON.stringify(data));
  });
}

// Calculate delivery date as 6 days from now
function getDeliveryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 6);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Get tracking data from localStorage or fallback
function getTrackingData(trackingNumber) {
  // Check localStorage first
  const stored = localStorage.getItem(`${STORAGE_KEY}-${trackingNumber}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored data:', e);
    }
  }
  
  // Fall back to hardcoded data
  return BASE_TRACKING_DATA[trackingNumber] || null;
}

// Save tracking data to localStorage
function saveTrackingData(trackingNumber, data) {
  localStorage.setItem(`${STORAGE_KEY}-${trackingNumber}`, JSON.stringify(data));
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

function loadOverrides() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
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
  deliveryDate.textContent = getDeliveryDate();
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
  
  if (!cleaned) {
    showError('Please enter a tracking number');
    return;
  }

  // Try to get tracking data
  const data = getTrackingData(cleaned);
  
  if (data) {
    showResult(data, cleaned);
  } else {
    showError('Tracking number not found');
  }
});

trackingNumberInput.addEventListener('input', () => {
  if (statusMessage.textContent) {
    clearError();
  }
});

// Initialize sample data on page load
document.addEventListener('DOMContentLoaded', initializeSampleDataIfNeeded);
