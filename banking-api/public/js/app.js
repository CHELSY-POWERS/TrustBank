const API_BASE = '/api/v1';

// State
let state = {
  token: localStorage.getItem('token') || null,
  user: null,
  accounts: [],
  transactions: []
};

// Elements
const el = {
  authView: document.getElementById('auth-view'),
  dashboardView: document.getElementById('dashboard-view'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  showRegister: document.getElementById('show-register'),
  showLogin: document.getElementById('show-login'),
  userGreeting: document.getElementById('user-greeting'),
  logoutBtn: document.getElementById('logout-btn'),
  accountsList: document.getElementById('accounts-list'),
  createAccountBtn: document.getElementById('create-account-btn'),
  tabBtns: document.querySelectorAll('.tab-btn'),
  actionForms: document.querySelectorAll('.action-form'),
  depositForm: document.getElementById('deposit-form'),
  withdrawForm: document.getElementById('withdraw-form'),
  transferForm: document.getElementById('transfer-form'),
  historyAccountFilter: document.getElementById('history-account-filter'),
  transactionsList: document.getElementById('transactions-list'),
};

// Notification Utility
function notify(message, type = 'success') {
  const container = document.getElementById('notification-container');
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  container.appendChild(notif);
  setTimeout(() => {
    notif.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

// API Utility
async function api(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  } catch (err) {
    notify(err.message, 'error');
    if (err.message.toLowerCase().includes('unauthorized') || err.message.includes('token')) {
      logout();
    }
    throw err;
  }
}

// Initialization
async function init() {
  if (state.token) {
    try {
      const res = await api('/auth/profile');
      state.user = res.data;
      showView('dashboard');
      await loadDashboard();
    } catch { logout(); }
  } else {
    showView('auth');
  }
}

function showView(view) {
  el.authView.classList.remove('active');
  el.dashboardView.classList.remove('active');
  if (view === 'auth') el.authView.classList.add('active');
  if (view === 'dashboard') el.dashboardView.classList.add('active');
}

// Auth Logic
el.showRegister.onclick = (e) => { e.preventDefault(); el.loginForm.classList.remove('active'); el.registerForm.classList.add('active'); };
el.showLogin.onclick = (e) => { e.preventDefault(); el.registerForm.classList.remove('active'); el.loginForm.classList.add('active'); };

el.loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    state.token = res.data.token;
    localStorage.setItem('token', state.token);
    notify('Login successful!');
    init();
  } catch (err) {}
};

el.registerForm.onsubmit = async (e) => {
  e.preventDefault();
  const payload = {
    firstName: document.getElementById('reg-firstName').value,
    lastName: document.getElementById('reg-lastName').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value
  };
  try {
    const res = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    state.token = res.data.token;
    localStorage.setItem('token', state.token);
    notify('Registration successful!');
    init();
  } catch (err) {}
};

function logout() {
  state.token = null; state.user = null;
  localStorage.removeItem('token');
  showView('auth');
}
el.logoutBtn.onclick = logout;

// Dashboard Logic
async function loadDashboard() {
  el.userGreeting.textContent = `Hello, ${state.user.firstName}`;
  await fetchAccounts();
  // Set first account as default filter for history if exists
  if (state.accounts.length > 0) {
    fetchHistory(state.accounts[0].id);
  }
}

async function fetchAccounts() {
  try {
    const res = await api('/accounts');
    state.accounts = res.data;
    renderAccounts();
    populateAccountSelects();
  } catch (err) {}
}

function renderAccounts() {
  el.accountsList.innerHTML = '';
  if (state.accounts.length === 0) {
    el.accountsList.innerHTML = '<p>No accounts found. Create one to get started.</p>';
    return;
  }
  
  state.accounts.forEach(acc => {
    const card = document.createElement('div');
    card.className = 'account-card';
    card.innerHTML = `
      <div class="account-type">${acc.accountType}</div>
      <div class="account-balance">${parseFloat(acc.balance).toLocaleString('en-US', { style: 'currency', currency: acc.currency || 'USD' })}</div>
      <div class="account-number">ID: ${acc.id}</div>
    `;
    // Click card to view its history
    card.style.cursor = 'pointer';
    card.onclick = () => {
      el.historyAccountFilter.value = acc.id;
      fetchHistory(acc.id);
    };
    el.accountsList.appendChild(card);
  });
}

function populateAccountSelects() {
  const depositSel = document.getElementById('deposit-account');
  const withdrawSel = document.getElementById('withdraw-account');
  const transferFromSel = document.getElementById('transfer-from');
  const filterSel = el.historyAccountFilter;
  
  const optionsHtml = state.accounts.map(a => `<option value="${a.id}">${a.accountType} (${a.id.substring(0,8)}...)</option>`).join('');
  
  depositSel.innerHTML = optionsHtml;
  withdrawSel.innerHTML = optionsHtml;
  transferFromSel.innerHTML = optionsHtml;
  
  filterSel.innerHTML = '<option value="">All Accounts</option>' + optionsHtml;
  if(state.accounts.length > 0) {
    depositSel.value = state.accounts[0].id;
    withdrawSel.value = state.accounts[0].id;
    transferFromSel.value = state.accounts[0].id;
  }
}

el.createAccountBtn.onclick = async () => {
  try {
    await api('/accounts', { method: 'POST', body: JSON.stringify({ accountType: 'checking' }) });
    notify('New checking account created!');
    await fetchAccounts();
  } catch (err) {}
};

// Tabs
el.tabBtns.forEach(btn => {
  btn.onclick = () => {
    el.tabBtns.forEach(b => b.classList.remove('active'));
    el.actionForms.forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  };
});

// Transactions
el.depositForm.onsubmit = async (e) => {
  e.preventDefault();
  const accId = document.getElementById('deposit-account').value;
  const amount = parseFloat(document.getElementById('deposit-amount').value);
  try {
    await api(`/transactions/accounts/${accId}/deposit`, { method: 'POST', body: JSON.stringify({ amount, description: 'UI Deposit' }) });
    notify('Deposit successful!');
    e.target.reset();
    await fetchAccounts();
    fetchHistory(accId);
  } catch(err) {}
};

el.withdrawForm.onsubmit = async (e) => {
  e.preventDefault();
  const accId = document.getElementById('withdraw-account').value;
  const amount = parseFloat(document.getElementById('withdraw-amount').value);
  try {
    await api(`/transactions/accounts/${accId}/withdraw`, { method: 'POST', body: JSON.stringify({ amount, description: 'UI Withdrawal' }) });
    notify('Withdrawal successful!');
    e.target.reset();
    await fetchAccounts();
    fetchHistory(accId);
  } catch(err) {}
};

el.transferForm.onsubmit = async (e) => {
  e.preventDefault();
  const fromAcc = document.getElementById('transfer-from').value;
  const toAcc = document.getElementById('transfer-to').value;
  const amount = parseFloat(document.getElementById('transfer-amount').value);
  try {
    await api('/transactions/transfer', { method: 'POST', body: JSON.stringify({ fromAccountId: fromAcc, toAccountId: toAcc, amount, description: 'UI Transfer' }) });
    notify('Transfer successful!');
    e.target.reset();
    await fetchAccounts();
    fetchHistory(fromAcc);
  } catch(err) {}
};

el.historyAccountFilter.onchange = (e) => {
  if (e.target.value) fetchHistory(e.target.value);
};

async function fetchHistory(accountId) {
  try {
    const res = await api(`/transactions/accounts/${accountId}/history`);
    state.transactions = res.data.transactions;
    renderHistory(accountId);
  } catch (err) {}
}

function renderHistory(activeAccountId) {
  el.transactionsList.innerHTML = '';
  if (state.transactions.length === 0) {
    el.transactionsList.innerHTML = '<p style="color:var(--text-secondary); text-align:center; margin-top:2rem;">No recent transactions.</p>';
    return;
  }
  
  state.transactions.forEach(tx => {
    const isDeposit = tx.type === 'deposit';
    const isWithdrawal = tx.type === 'withdrawal';
    // For transfer, if my account is 'toAccountId', it's a deposit to me. If it's 'fromAccountId', it's a withdrawal from me.
    let isIncoming = isDeposit;
    if (tx.type === 'transfer') {
      isIncoming = tx.toAccountId === activeAccountId;
    }
    
    const amountClass = isIncoming ? 'positive' : 'negative';
    const sign = isIncoming ? '+' : '-';
    
    const item = document.createElement('div');
    item.className = `tx-item ${tx.type}`;
    item.innerHTML = `
      <div class="tx-info">
        <h4>${tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</h4>
        <div class="tx-date">${new Date(tx.createdAt).toLocaleString()}</div>
      </div>
      <div class="tx-amount ${amountClass}">${sign}$${parseFloat(tx.amount).toFixed(2)}</div>
    `;
    el.transactionsList.appendChild(item);
  });
}

// Start
init();
