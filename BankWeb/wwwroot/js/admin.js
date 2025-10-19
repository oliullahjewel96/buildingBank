import { updateMe } from './apiClient.js';

const panels = ['login', 'adminProfile', 'users', 'transactions', 'logs'];
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

async function bootAfterLogin() {
    const nav = document.querySelector('.nav');
    if (nav) nav.style.display = 'flex';
    await initAdminProfile();
    showPanel('adminProfile');
}

/* ----------------- Admin Profile (mock load) ----------------- */
async function initAdminProfile() {
    const response = await fetch('/mock/admin-me.json');
    const me = await response.json();

    const pic = document.getElementById('admin-profile-pic');
    if (pic) pic.src = me.pictureUrl || '/img/avatar.png';

    setText('admin-profile-name', me.name);
    setText('admin-profile-email', me.email);
    setText('admin-profile-phone', me.phone);

    setValue('admin-input-name', me.name);
    setValue('admin-input-email', me.email);
    setValue('admin-input-phone', me.phone);
}

/* ----------------- Admin Profile edit/save ----------------- */
const adminEditBtn = document.getElementById('admin-btn-edit-profile');
const adminProfileForm = document.getElementById('admin-profile-form');
const adminProfileView = document.getElementById('admin-profile-view');
const adminProfileMsg = document.getElementById('admin-profile-msg');

adminEditBtn?.addEventListener('click', () => {
    adminProfileForm.hidden = false;
    adminProfileView.hidden = true;
});

document.getElementById('admin-btn-cancel-profile')?.addEventListener('click', () => {
    adminProfileForm.hidden = true;
    adminProfileView.hidden = false;
});

adminProfileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: getValue('admin-input-name').trim(),
        email: getValue('admin-input-email').trim(),
        phone: getValue('admin-input-phone').trim(),
    };
    try {
        await updateMe(payload);
        flash(adminProfileMsg, 'Saved ✅', true);
    } catch {
        flash(adminProfileMsg, 'Error saving profile ❌', false);
    } finally {
        setText('admin-profile-name', payload.name);
        setText('admin-profile-email', payload.email);
        setText('admin-profile-phone', payload.phone);
        adminProfileForm.hidden = true;
        adminProfileView.hidden = false;
    }
});


async function initUsers() { }
async function initAdminTransactions() { }
async function initAuditLogs() { }

/* ----------------- Nav ----------------- */
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
        isLoggedIn = true;
        flash(out, 'Login successful ✅', true);
        setTimeout(() => { bootAfterLogin(); }, 400);
    } else {
        flash(out, 'Invalid credentials ❌', false);
    }
});

showPanel('login');
