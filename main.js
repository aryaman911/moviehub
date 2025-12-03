// Simple global state
const state = {
  currentUser: null,      // { email, role }
  selectedSeriesId: null, // number
};

// Dummy data for now (later we'll fetch this from your API)
const series = [
  { id: 4001, name: 'Midnight City', language: 'EN', originCountry: 'USA',
    genres: ['DRAMA', 'THRILLER'], producerHouse: 'Sunrise Studios', nextSchedule: '2025-12-15 20:00' },
  { id: 4002, name: 'Mumbai Nights', language: 'HI', originCountry: 'IND',
    genres: ['DRAMA', 'ROMANCE'], producerHouse: 'Bollywood Dreams', nextSchedule: '2025-12-16 21:00' },
  { id: 4003, name: 'Berlin Shadows', language: 'DE', originCountry: 'DEU',
    genres: ['THRILLER'], producerHouse: 'Berlin Studios', nextSchedule: '2025-12-17 19:00' },
  { id: 4004, name: 'Tokyo Dreams', language: 'JA', originCountry: 'JPN',
    genres: ['ANIME', 'ROMANCE'], producerHouse: 'Tokyo Vision', nextSchedule: '2025-12-18 18:30' },
];

const feedbackSample = [
  { seriesId: 4001, user: 'alice', rating: 5, text: 'Loved the city vibes!' },
  { seriesId: 4001, user: 'bob',   rating: 4, text: 'Great pacing.' },
  { seriesId: 4002, user: 'carol', rating: 4, text: 'Nice drama.' },
];

const contracts = [
  { id: 5001, seriesId: 4001, seriesName: 'Midnight City',   house: 'Sunrise Studios',
    start: '2023-01-01', end: '2024-01-01', charge: 1500.00, status: 'ACTIVE' },
  { id: 5002, seriesId: 4002, seriesName: 'Mumbai Nights',   house: 'Bollywood Dreams',
    start: '2023-02-01', end: '2024-02-01', charge: 1200.00, status: 'ACTIVE' },
  { id: 5003, seriesId: 4003, seriesName: 'Berlin Shadows',  house: 'Berlin Studios',
    start: '2023-03-01', end: '2024-03-01', charge: 1400.00, status: 'ACTIVE' },
];

// DOM helpers
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

function showSection(id) {
  ['auth-section', 'home-section', 'customer-section', 'employee-section', 'contracts-section']
    .forEach(secId => {
      qs('#' + secId).classList.toggle('section-hidden', secId !== id);
    });
}

function updateHeader() {
  const label = qs('#header-user-label');
  if (!state.currentUser) {
    label.textContent = 'Not signed in';
  } else {
    label.innerHTML =
      `${state.currentUser.email} · <span class="badge-role">${state.currentUser.role}</span>`;
  }
}

// ---- Auth tab switching ----
qsa('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    qsa('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const which = tab.dataset.authTab;
    qs('#login-form').classList.toggle('section-hidden', which !== 'login');
    qs('#register-form').classList.toggle('section-hidden', which !== 'register');
  });
});

// ---- Login ----
qs('#loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = qs('#login-email').value || 'demo@example.com';
  const role  = qs('#login-role').value;  // CUSTOMER or EMPLOYEE

  state.currentUser = { email, role };
  updateHeader();
  renderSeriesList();
  renderEmployeeTable();
  renderContractsTable();
  showSection('home-section');
});

// ---- Register (demo only) ----
qs('#registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = qs('#reg-email').value || 'newuser@example.com';
  const role  = qs('#reg-role').value;
  alert(`Registration simulated. Now signed in as ${role}.`);
  state.currentUser = { email, role };
  updateHeader();
  renderSeriesList();
  renderEmployeeTable();
  renderContractsTable();
  showSection('home-section');
});

// ---- Home buttons ----
qs('#btn-home-customer-view').addEventListener('click', () => {
  showSection('customer-section');
});

qs('#btn-home-employee-view').addEventListener('click', () => {
  if (!state.currentUser || state.currentUser.role !== 'EMPLOYEE') {
    alert('Employee access only.');
    return;
  }
  showSection('employee-section');
});

qs('#btn-home-contracts').addEventListener('click', () => {
  if (!state.currentUser || state.currentUser.role !== 'EMPLOYEE') {
    alert('Employee access only.');
    return;
  }
  showSection('contracts-section');
});

// ---- Render series list on home page ----
function renderSeriesList() {
  const list = qs('#series-list');
  list.innerHTML = '';
  series.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${s.name}</h3>
      <p class="muted">
        Language: ${s.language} • Origin: ${s.originCountry}<br />
        Production House: ${s.producerHouse}<br />
        Next scheduled: ${s.nextSchedule}
      </p>
      <div>
        ${s.genres.map(g => `<span class="pill">${g}</span>`).join('')}
      </div>
      <br />
      <button class="btn small" data-series-id="${s.id}">View details</button>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('button[data-series-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.seriesId);
      state.selectedSeriesId = id;
      populateCustomerView(id);
      showSection('customer-section');
    });
  });
}

// ---- Customer view & rating ----
function populateCustomerView(seriesId) {
  const s = series.find(x => x.id === seriesId);
  if (!s) return;

  qs('#customer-series-details').classList.remove('section-hidden');
  qs('#cust-series-title').textContent = s.name;
  qs('#cust-series-meta').textContent =
    `Language: ${s.language} • Origin: ${s.originCountry} • Producer: ${s.producerHouse}`;

  const list = qs('#rating-list');
  list.innerHTML = '';
  feedbackSample
    .filter(f => f.seriesId === seriesId)
    .forEach(f => {
      const li = document.createElement('li');
      li.textContent = `${f.user} – ${f.rating}/5 – ${f.text}`;
      list.appendChild(li);
    });
}

qs('#ratingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!state.currentUser) {
    alert('Please log in first.');
    return;
  }
  const rating = Number(qs('#rating-value').value);
  const text   = qs('#rating-text').value.trim() || '(no comment)';
  feedbackSample.push({
    seriesId: state.selectedSeriesId,
    user: state.currentUser.email,
    rating,
    text
  });
  populateCustomerView(state.selectedSeriesId);
  qs('#ratingForm').reset();
  alert('Rating submitted (demo only, not saved to DB yet).');
});

// ---- Employee table ----
function renderEmployeeTable() {
  const tbody = qs('#employee-series-table');
  tbody.innerHTML = '';
  series.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.language}</td>
      <td>${s.producerHouse}</td>
      <td>${s.nextSchedule}</td>
      <td>
        <button class="btn small secondary">Edit</button>
        <button class="btn small secondary">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- Contracts table ----
function renderContractsTable() {
  const tbody = qs('#contracts-table');
  tbody.innerHTML = '';
  contracts.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.seriesName}</td>
      <td>${c.house}</td>
      <td>${c.start}</td>
      <td>${c.end}</td>
      <td>$${c.charge.toFixed(2)}</td>
      <td>${c.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// initial header
updateHeader();
