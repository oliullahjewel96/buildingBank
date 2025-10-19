import { getMe, updateMe } from './apiClient.js';

const panels = ['login', 'adminProfile', 'users', 'transactions', 'logs'];
let isLoggedIn = false;
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

async function bootAfterLogin() {
    const nav = document.querySelector('.nav');
    if (nav) nav.style.display = 'flex';
    await initAdminProfile();
    showPanel('adminProfile');
}

async function initAdminProfile() {
    try {
        const me = await getMe();
    } catch {
    }
}

async function initUsers() { }

async function initAdminTransactions() { }

async function initAuditLogs() { }

document.getElementById('nav-adminProfile')?.addEventListener('click', () => isLoggedIn && showPanel('adminProfile'));
document.getElementById('nav-users')?.addEventListener('click', () => { if (!isLoggedIn) return; showPanel('users'); initUsers(); });
document.getElementById('nav-transactions')?.addEventListener('click', () => { if (!isLoggedIn) return; showPanel('transactions'); initAdminTransactions(); });
document.getElementById('nav-logs')?.addEventListener('click', () => { if (!isLoggedIn) return; showPanel('logs'); initAuditLogs(); });
document.getElementById('nav-logout')?.addEventListener('click', () => {
    isLoggedIn = false;
    flash(document.getElementById('login-msg'), 'Logged out', true);
    setTimeout(() => { window.location.href = '/Home'; }, 500);
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = getValue('login-email').trim();
    const pass = getValue('login-pass').trim();
    const out = document.getElementById('login-msg');

    if (email && pass) {
        // TODO: replace with real admin auth later
        isLoggedIn = true;
        flash(out, 'Login successful ✅', true);
        setTimeout(() => { bootAfterLogin(); }, 400);
    } else {
        flash(out, 'Invalid credentials ❌', false);
    }
});

showPanel('login');