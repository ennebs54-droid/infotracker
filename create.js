const createMsg = document.getElementById('createMsg');
const STORAGE_KEY = 'tracking-data';

document.getElementById('create-form').addEventListener('submit', (e) => {
  e.preventDefault();
  createMsg.style.color = '';
  createMsg.textContent = '';

  const id = document.getElementById('newTrackId').value.trim().toUpperCase();
  if (!id) { createMsg.textContent = 'Tracking ID is required.'; return; }

  const progressRaw = document.getElementById('newProgress').value.trim();
  const progress = progressRaw ? progressRaw.split(',').map(s => s.trim()).filter(Boolean) : ['Ordered'];

  const timelineRaw = document.getElementById('newTimeline').value.trim();
  const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const timeline = timelineRaw
    ? timelineRaw.split('\n').filter(Boolean).map(line => {
        const [event, note] = line.split('|').map(s => s.trim());
        return { time: now, event: event || '', note: note || '' };
      })
    : [{ time: now, event: 'Shipment Created', note: 'Tracking ID has been created.' }];

  const future = new Date();
  future.setDate(future.getDate() + 7);
  const estDelivery = future.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const data = {
    status: document.getElementById('newStatus').value,
    courier: document.getElementById('newCourier').value.trim() || 'Standard Courier',
    company: document.getElementById('newCompany').value.trim() || 'TrackSuite',
    location: document.getElementById('newLocation').value.trim() || 'Pending Location',
    estimatedDelivery: document.getElementById('newDelivery').value.trim() || estDelivery,
    latestUpdate: document.getElementById('newUpdate').value.trim() || 'Shipment is being processed.',
    originAddress: document.getElementById('newOrigin').value.trim() || 'Unknown',
    progress,
    timeline
  };

  try {
    localStorage.setItem(`${STORAGE_KEY}-${id}`, JSON.stringify(data));
    createMsg.style.color = '#10d98a';
    createMsg.textContent = `Tracking ID "${id}" created! Anyone can now look it up.`;
    document.getElementById('create-form').reset();
    lucide.replace();
  } catch (err) {
    createMsg.textContent = 'Error saving: ' + err.message;
  }
});

window.addEventListener('load', () => lucide.replace());
