import { getMe, updateMe, getAccounts, getTransactions, createTransfer } from './apiClient.js';

const panels = ['login', 'profile', 'accounts', 'transactions', 'transfer'];
let isLoggedIn = false;

/* ----------------- UI helpers ----------------- */
function showPanel(name) {
    panels.forEach(p => {
        const panel = document.getElementById(`panel-${p}`);
        if (panel) panel.hidden = (p !== name);
        const btn = document.getElementById(`nav-${p}`);
        if (btn) btn.classList.toggle('active', p === name);
    });
    const nav = document.querySelector('.nav');
    if (nav) nav.style.display = isLoggedIn ? 'flex' : 'none';
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function getValue(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function flash(el, text, success = true) {
    if (!el) return;
    el.textContent = text;
    el.className = success ? 'msg success' : 'msg error';
    el.hidden = false;
    setTimeout(() => { el.hidden = true; }, 2200);
}

/* ----------------- Boot after login ----------------- */
async function bootAfterLogin() {
    // show nav
    const nav = document.querySelector('.nav');
    if (nav) nav.style.display = 'flex';

    await initProfile();
    await initAccounts();
    showPanel('profile');
}

/* ----------------- Profile ----------------- */
async function initProfile() {
    const me = await getMe();
    const pic = document.getElementById('profile-pic');
    if (pic) pic.src = me.pictureUrl || '/img/avatar.png';
    setText('profile-name', me.name);
    setText('profile-email', me.email);
    setText('profile-phone', me.phone);

    setValue('input-name', me.name);
    setValue('input-email', me.email);
    setValue('input-phone', me.phone);
}

const editBtn = document.getElementById('btn-edit-profile');
const profileForm = document.getElementById('profile-form');
const profileView = document.getElementById('profile-view');
const profileMsg = document.getElementById('profile-msg');

editBtn?.addEventListener('click', () => { profileForm.hidden = false; profileView.hidden = true; });
document.getElementById('btn-cancel-profile')?.addEventListener('click', () => { profileForm.hidden = true; profileView.hidden = false; });

profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: getValue('input-name').trim(),
        email: getValue('input-email').trim(),
        phone: getValue('input-phone').trim()
    };
    try {
        await updateMe(payload);
        setText('profile-name', payload.name);
        setText('profile-email', payload.email);
        setText('profile-phone', payload.phone);
        flash(profileMsg, 'Saved', true);
    } catch {
        flash(profileMsg, 'Error saving profile', false);
    } finally {
        profileForm.hidden = true; profileView.hidden = false;
    }
});

/* ----------------- Accounts & Transactions ----------------- */
let accounts = [];
let currentAccountId = null;

async function initAccounts() {
    accounts = await getAccounts();
    const list = document.getElementById('accounts-list');
    const fromSel = document.getElementById('from-account');

    if (list) list.innerHTML = '';
    if (fromSel) fromSel.innerHTML = '';

    accounts.forEach(a => {
        const li = document.createElement('li');
        li.className = 'row';
        li.innerHTML = `<button class="btn" data-id="${a.id}">${a.number}</button>
                        <span class="right">$${a.balance.toFixed(2)}</span>`;
        li.querySelector('button').addEventListener('click', () => loadTransactions(a.id)); // switch to tx
        list.appendChild(li);

        const opt = document.createElement('option');
        opt.value = a.id; opt.textContent = `${a.number} ($${a.balance.toFixed(2)})`;
        fromSel?.appendChild(opt);
    });

    // do NOT auto-load transactions here; wait for user click or explicit filter
}

async function loadTransactions(accountId, opts = { switchPanel: true }) {
    currentAccountId = accountId;
    const from = getValue('from-date');
    const to = getValue('to-date');
    const rows = await getTransactions(accountId, from, to);

    const tbody = document.querySelector('#tx-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const empty = document.getElementById('tx-empty');
    if (empty) empty.hidden = rows.length !== 0;

    rows.forEach(r => {
        const tr = document.createElement('tr');
        const amt = Number(r.amount).toFixed(2);
        tr.innerHTML = `<td>${r.date}</td><td>${r.description}</td><td class="right">${amt}</td>`;
        tbody.appendChild(tr);
    });

    if (opts.switchPanel) showPanel('transactions');
}

document.getElementById('tx-filter')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentAccountId) loadTransactions(currentAccountId); // default switchPanel:true
});

/* ----------------- Transfer ----------------- */
document.getElementById('transfer-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = document.getElementById('transfer-msg');

    const payload = {
        fromAccountId: parseInt(getValue('from-account'), 10),
        toAccountNumber: getValue('to-number').trim(),
        amount: parseFloat(getValue('amount')),
        description: getValue('description').trim()
    };

    if (!payload.fromAccountId || !payload.toAccountNumber || !payload.amount || payload.amount <= 0) {
        return flash(out, 'Please fill all fields with valid values', false);
    }

    try {
        await createTransfer(payload);
        flash(out, 'Transfer successful ✅', true);
        setValue('amount', '');
        setValue('description', '');
        if (currentAccountId) await loadTransactions(currentAccountId, { switchPanel: false }); // stay on Transfer
    } catch {
        flash(out, 'Transfer failed ❌', false);
    }
});

/* ----------------- Nav ----------------- */
document.getElementById('nav-profile')?.addEventListener('click', () => isLoggedIn && showPanel('profile'));
document.getElementById('nav-accounts')?.addEventListener('click', () => isLoggedIn && showPanel('accounts'));
document.getElementById('nav-transactions')?.addEventListener('click', () => isLoggedIn && showPanel('transactions'));
document.getElementById('nav-transfer')?.addEventListener('click', () => isLoggedIn && showPanel('transfer'));
document.getElementById('nav-logout')?.addEventListener('click', () => {
    isLoggedIn = false;
    flash(document.getElementById('login-msg'), 'Logged out', true);
    showPanel('login');
});

/* ----------------- Login ----------------- */
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = getValue('login-email').trim();
    const pass = getValue('login-pass').trim();
    const out = document.getElementById('login-msg');

    if (email && pass) {
        isLoggedIn = true;
        flash(out, 'Login successful ✅', true);
        setTimeout(() => { bootAfterLogin(); }, 500);
    } else {
        flash(out, 'Invalid credentials ❌', false);
    }
});

/* ----------------- Initial ----------------- */
showPanel('login'); // start hidden nav + show login
