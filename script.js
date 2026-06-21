// Base demo tracking data (preloaded in Firebase on first setup)
const BASE_TRACKING_DATA = {
  GECG1472: {
    status: 'Awaiting Custom Fee Approval',
    courier: 'Global Express',
    company: 'Global Express',
    estimatedDelivery: 'July 4, 2026',
    latestUpdate: 'Package is awaiting custom fee approval before it can be processed and released.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timeline: [
      { time: 'Today, 9:15 AM', event: 'Awaiting Custom Fee Approval', note: 'Package is pending custom fee approval before it can be processed.' },
      { time: 'Today, 6:00 AM', event: 'Arrived at Customs', note: 'Package has arrived and is awaiting customs clearance.' },
      { time: 'Yesterday, 11:30 PM', event: 'In Transit', note: 'Package departed from Manchester, UK facility.' }
    ],
    originAddress: 'Manchester, UK',
    location: 'Manchester, UK'
  },
  TRKBU372: {
    status: 'In Transit',
    courier: 'Global Express',
    company: 'FedEx Logistics',
    estimatedDelivery: 'May 14, 2026',
    latestUpdate: 'Package departed sort facility and is en route to destination country.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timeline: [
      { time: 'Today, 10:24 AM', event: 'Departed sort facility', note: 'Package is in transit to regional hub.' },
      { time: 'Yesterday, 7:12 PM', event: 'Shipment picked up', note: 'Pickup confirmed by courier partner.' },
      { time: 'Yesterday, 8:00 AM', event: 'Shipment processed', note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: 'Manchester, UK'
  },
  DGF26534: {
    status: 'In Transit',
    courier: 'Global Express',
    company: 'FedEx Logistics',
    estimatedDelivery: 'May 14, 2026',
    latestUpdate: 'Package departed sort facility and is en route to destination country.',
    progress: ['Ordered', 'Confirmed', 'Shipped'],
    timeline: [
      { time: 'Today, 10:24 AM', event: 'Departed sort facility', note: 'Package is in transit to regional hub.' },
      { time: 'Yesterday, 7:12 PM', event: 'Shipment picked up', note: 'Pickup confirmed by courier partner.' },
      { time: 'Yesterday, 8:00 AM', event: 'Shipment processed', note: 'Shipment has entered the carrier network.' }
    ],
    originAddress: 'Manchester, UK'
  },
  TEAFD5372: {
    status: 'Awaiting Approval',
    courier: 'Global Express',
    company: 'FedEx Logistics',
    estimatedDelivery: 'May 14, 2026',
    latestUpdate: 'Package is awaiting approval before processing in destination country.',
    progress: ['Ordered', 'Confirmed'],
    timeline: [
      { time: 'Today, 10:24 AM', event: 'Awaiting Approval', note: 'Package is pending approval before it can be processed.' },
      { time: 'Yesterday, 8:00 AM', event: 'Order Confirmed', note: 'Order has been confirmed and is awaiting approval.' }
    ],
    originAddress: 'Manchester, UK'
  }
};

function getAllTrackingData() {
  return new Promise((resolve) => {
    if (!window.db) { resolve(BASE_TRACKING_DATA); return; }
    window.db.ref('tracking').once('value', (snapshot) => {
      resolve({ ...BASE_TRACKING_DATA, ...(snapshot.val() || {}) });
    }).catch(() => resolve(BASE_TRACKING_DATA));
  });
}

let trackForm, trackingNumberInput, statusMessage, progressBar, stepElements, shippedAddressField, statusBadge, displayTracking, deliveryDate, courierInfo, companyName, packageLocation, latestUpdate, timelineList, resultsSection;

function initializeDOM() {
  trackForm = document.getElementById('track-form');
  trackingNumberInput = document.getElementById('trackingNumber');
  statusMessage = document.getElementById('statusMessage');
  progressBar = document.getElementById('progressBar');
  stepElements = Array.from(document.querySelectorAll('.step'));
  shippedAddressField = document.getElementById('shippedAddress');
  statusBadge = document.getElementById('statusBadge');
  displayTracking = document.getElementById('displayTracking');
  deliveryDate = document.getElementById('deliveryDate');
  courierInfo = document.getElementById('courierInfo');
  companyName = document.getElementById('companyName');
  packageLocation = document.getElementById('packageLocation');
  latestUpdate = document.getElementById('latestUpdate');
  timelineList = document.getElementById('timelineList');
  resultsSection = document.getElementById('resultsSection');
  
  if (!trackForm) {
    console.error('Form not found');
    return;
  }
  
  trackForm.addEventListener('submit', handleFormSubmit);
  trackingNumberInput.addEventListener('input', () => {
    if (statusMessage.textContent) clearError();
  });
}

async function handleFormSubmit(event) {
  event.preventDefault();
  clearError();
  const cleaned = trackingNumberInput.value.trim().toUpperCase();
  
  if (!cleaned) {
    showError('Please enter a tracking number');
    return;
  }
  
  const allData = await getAllTrackingData();
  
  if (!allData[cleaned]) {
    showError('Invalid Tracking Number');
    return;
  }
  
  const trackData = allData[cleaned];
  const useIp = trackData.useIpLocation || cleaned === 'TEAFD5372';
  showResult(trackData, cleaned, useIp);
}

const statusStyles = {
  'Awaiting Approval': { background: '#e74c3c', text: '#ffffff' },
  'Awaiting Custom Fee Approval': { background: '#e74c3c', text: '#ffffff' },
  'Delivered': { background: '#2f9c69', text: '#ffffff' },
  'In Transit': { background: '#f39c12', text: '#ffffff' },
  'Processing': { background: '#5b5fd3', text: '#ffffff' },
  'Confirmed': { background: '#3498db', text: '#ffffff' },
  'Out for Delivery': { background: '#f39c12', text: '#ffffff' }
};

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
    } else {
      stepEl.classList.remove('active');
    }
    stepEl.querySelector('.step-dot').style.background = index < completed ? '#2563eb' : '#e5e7eb';
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

function showResult(data, trackingKey, useIp = false) {
  displayTracking.textContent = trackingKey;
  deliveryDate.textContent = data.estimatedDelivery;
  courierInfo.textContent = data.courier;
  companyName.textContent = data.company;
  shippedAddressField.innerHTML = data.originAddress;
  packageLocation.textContent = 'Loading...';
  latestUpdate.textContent = data.latestUpdate;
  setStatusBadge(data.status);
  setProgress(data.progress);
  renderTimeline(data.timeline);
  resultsSection.classList.remove('hidden');

  fetch('https://ipapi.co/json/')
    .then(r => r.json())
    .then(geo => {
      const country = geo.country_name || 'Unknown';
      if (useIp) {
        const future = new Date();
        future.setDate(future.getDate() + 2);
        deliveryDate.textContent = future.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        packageLocation.textContent = country;
        latestUpdate.textContent = data.latestUpdate.replace('destination country', country);
      } else {
        const future = new Date();
        future.setDate(future.getDate() + 6);
        deliveryDate.textContent = future.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        packageLocation.textContent = data.location || 'Manchester, UK';
        latestUpdate.textContent = data.latestUpdate;
      }
    })
    .catch(() => {
      packageLocation.textContent = useIp ? 'Unknown' : (data.location || 'Manchester, UK');
      latestUpdate.textContent = data.latestUpdate;
    });
}

function showError(message) {
  statusMessage.textContent = message;
  resultsSection.classList.add('hidden');
}

function clearError() {
  statusMessage.textContent = '';
}

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    trackingNumberInput.value = '';
    lucide.replace();
  });
} else {
  initializeDOM();
  trackingNumberInput.value = '';
  lucide.replace();
}
