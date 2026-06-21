const ADMIN_STORAGE_KEY = 'tracksuite_admin_data';
const PROGRESS_STAGES = ['Ordered', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const statusColors = {
  'Approved':         { color: '#10d98a', bg: 'rgba(16,217,138,0.12)' },
  'Not Approved':     { color: '#f04747', bg: 'rgba(240,71,71,0.12)' },
  'In Transit':       { color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
  'Awaiting Approval':{ color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)' },
  'Delivered':        { color: '#10d98a', bg: 'rgba(16,217,138,0.12)' },
  'Out for Delivery': { color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
};

function getAdminData() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveAdminData(data) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
}

function renderList() {
  const data = getAdminData();
  const list = document.getElementById('trackingList');
  const keys = Object.keys(data);

  if (keys.length === 0) {
    list.innerHTML = '<p class="tracking-list-empty">No tracking IDs created yet.</p>';
    return;
  }

  list.innerHTML = keys.map(id => {
    const t = data[id];
    const sc = statusColors[t.status] || { color: '#7a8499', bg: 'rgba(122,132,153,0.12)' };
    return `
      <div class="tracking-row">
        <div class="tracking-row-id">${id}</div>
        <div class="tracking-row-info">
          <span class="tracking-row-status" style="color:${sc.color};background:${sc.bg}">${t.status}</span>
          <span class="tracking-row-detail">📍 ${t.location} &nbsp;·&nbsp; 🏭 ${t.originAddress}</span>
          <span class="tracking-row-detail">🚚 ${t.courier}</span>
        </div>
        <div class="tracking-row-actions">
          <button class="action-btn edit" onclick="editTracking('${id}')"><i data-lucide="pencil"></i> Edit</button>
          <button class="action-btn delete" onclick="deleteTracking('${id}')"><i data-lucide="trash-2"></i> Delete</button>
        </div>
      </div>
    `;
  }).join('');

  lucide.replace();
}

function deleteTracking(id) {
  const data = getAdminData();
  delete data[id];
  saveAdminData(data);
  renderList();
}

function editTracking(id) {
  const data = getAdminData();
  const t = data[id];
  if (!t) return;

  document.getElementById('newTrackingId').value = id;
  document.getElementById('newCourier').value = t.courier;
  document.getElementById('newOrigin').value = t.originAddress;
  document.getElementById('newLocation').value = t.location;
  document.getElementById('newUpdate').value = t.latestUpdate;
  document.getElementById('newProgress').value = t.progress.length;
  document.getElementById('useIpLocation').checked = t.useIpLocation || false;

  const knownStatuses = ['Approved', 'Not Approved', 'In Transit', 'Awaiting Approval', 'Delivered', 'Out for Delivery'];
  if (knownStatuses.includes(t.status)) {
    document.querySelector(`input[name="status"][value="${t.status}"]`).checked = true;
    document.getElementById('customStatusWrap').style.display = 'none';
  } else {
    document.querySelector('input[name="status"][value="custom"]').checked = true;
    document.getElementById('customStatus').value = t.status;
    document.getElementById('customStatusWrap').style.display = 'flex';
  }

  deleteTracking(id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('adminForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const id = document.getElementById('newTrackingId').value.trim().toUpperCase();
  const courier = document.getElementById('newCourier').value.trim();
  const origin = document.getElementById('newOrigin').value.trim();
  const location = document.getElementById('newLocation').value.trim();
  const update = document.getElementById('newUpdate').value.trim();
  const progressVal = parseInt(document.getElementById('newProgress').value);
  const useIp = document.getElementById('useIpLocation').checked;
  const selectedStatus = document.querySelector('input[name="status"]:checked').value;
  const status = selectedStatus === 'custom'
    ? document.getElementById('customStatus').value.trim()
    : selectedStatus;
  const msg = document.getElementById('adminFormMsg');

  if (!id || !courier || !origin || !location || !update || !status) {
    msg.textContent = 'Please fill in all fields.';
    msg.className = 'admin-msg error';
    return;
  }

  const data = getAdminData();
  data[id] = {
    status,
    courier,
    company: courier,
    location,
    originAddress: origin,
    latestUpdate: update,
    progress: PROGRESS_STAGES.slice(0, progressVal),
    timeline: [
      { time: 'Today', event: status, note: update }
    ],
    useIpLocation: useIp
  };

  saveAdminData(data);
  renderList();

  msg.textContent = `✓ Tracking ID "${id}" saved successfully.`;
  msg.className = 'admin-msg success';
  e.target.reset();
  document.getElementById('customStatusWrap').style.display = 'none';
  document.querySelector('input[name="status"][value="In Transit"]').checked = true;

  setTimeout(() => { msg.textContent = ''; }, 3000);
});

// Show/hide custom status input
document.querySelectorAll('input[name="status"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.getElementById('customStatusWrap').style.display =
      document.querySelector('input[name="status"]:checked').value === 'custom' ? 'flex' : 'none';
  });
});

renderList();
