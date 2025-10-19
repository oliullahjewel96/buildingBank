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
function escapeHtml(text) {
    return (text ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

async function bootAfterLogin() {
    const nav = document.querySelector('.nav');
    if (nav) nav.style.display = 'flex';
    await initAdminProfile();
    showPanel('adminProfile');
}

/* ----------------- Admin Profile ----------------- */
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

/* ----------------- Users Panel ----------------- */
let adminUsers = [];
const MOCK_USERS_URL = '/mock/users.json';

async function initUsers() {
    const searchTerm = getValue('q-user').trim();
    adminUsers = await fetchUsers(searchTerm);
    renderUsers(adminUsers);
}

async function fetchUsers(searchTerm) {
    // Try API first
    try {
        const apiUrl = searchTerm
            ? `/api/admin/users?q=${encodeURIComponent(searchTerm)}`
            : `/api/admin/users`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API unavailable');
        return await response.json();
    } catch (error) {
        console.warn('Using mock data instead of API:', error.message);
    }

    // Fallback: mock data
    const mockResponse = await fetch(MOCK_USERS_URL);
    const userList = await mockResponse.json();

    if (!searchTerm) return userList;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return userList.filter(user =>
        (user.name || '').toLowerCase().includes(lowerSearchTerm) ||
        (user.email || '').toLowerCase().includes(lowerSearchTerm) ||
        (user.accounts || []).some(account => String(account).includes(searchTerm))
    );
}

function renderUsers(userList) {
    const tableBody = document.getElementById('users-tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    userList.forEach(userData => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${escapeHtml(userData.name || '')}</td>
          <td>${escapeHtml(userData.email || '')}</td>
          <td>${escapeHtml(userData.phone || '')}</td>
          <td>${escapeHtml(userData.status || 'Active')}</td>
          <td>${(userData.accounts || []).map(account => `<code>${escapeHtml(String(account))}</code>`).join(', ')}</td>
          <td class="actions">
            <div class="btn-row">
              <button class="btn sm outline user-edit" data-id="${userData.id}">Edit</button>
              <button class="btn sm outline user-reset" data-id="${userData.id}">Reset PW</button>
              <button class="btn sm outline user-deact" data-id="${userData.id}">Deactivate</button>
            </div>
          </td>`;
        tableBody.appendChild(row);
    });

    tableBody.querySelectorAll('.user-edit')
        .forEach(button => button.addEventListener('click', () => openUserDialog(button.dataset.id)));
    tableBody.querySelectorAll('.user-deact')
        .forEach(button => button.addEventListener('click', () => deactivateUser(button.dataset.id)));
    tableBody.querySelectorAll('.user-reset')
        .forEach(button => button.addEventListener('click', () => resetPassword(button.dataset.id)));
}

/* ---- search + new user ---- */
document.getElementById('users-search')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await initUsers();
});
document.getElementById('btn-new-user')?.addEventListener('click', () => openUserDialog(null));

/* ---- create/edit ---- */
function openUserDialog(userId) {
    const dialogElement = document.getElementById('dlg-user');
    const dialogTitle = document.getElementById('dlg-user-title');
    const dialogUserId = document.getElementById('dlg-user-id');
    if (!dialogElement) return;

    if (userId) {
        const existingUser = adminUsers.find(user => String(user.id) === String(userId));
        dialogTitle.textContent = 'Edit User';
        dialogUserId.value = existingUser?.id ?? '';
        setValue('dlg-user-name', existingUser?.name ?? '');
        setValue('dlg-user-email', existingUser?.email ?? '');
        setValue('dlg-user-phone', existingUser?.phone ?? '');
    } else {
        dialogTitle.textContent = 'New User';
        dialogUserId.value = '';
        setValue('dlg-user-name', '');
        setValue('dlg-user-email', '');
        setValue('dlg-user-phone', '');
    }
    dialogElement.showModal();
}
document.getElementById('dlg-user-cancel')?.addEventListener('click', () => {
    document.getElementById('dlg-user')?.close();
});
document.getElementById('dlg-user-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = getValue('dlg-user-id') || null;
    const newUserData = {
        name: getValue('dlg-user-name').trim(),
        email: getValue('dlg-user-email').trim(),
        phone: getValue('dlg-user-phone').trim()
    };

    try {
        const apiUrl = userId ? `/api/admin/users/${encodeURIComponent(userId)}` : `/api/admin/users`;
        const method = userId ? 'PUT' : 'POST';
        const response = await fetch(apiUrl, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUserData)
        });
        if (!response.ok) throw new Error('API error');
        flash(document.getElementById('users-msg'), 'Saved ✅', true);
    } catch {
        if (userId) {
            const index = adminUsers.findIndex(user => String(user.id) === String(userId));
            if (index >= 0) adminUsers[index] = { ...adminUsers[index], ...newUserData };
        } else {
            const newUserId = Date.now();
            adminUsers.unshift({ id: newUserId, status: 'Active', accounts: [], ...newUserData });
        }
        flash(document.getElementById('users-msg'), 'Saved (mock) ✅', true);
    } finally {
        document.getElementById('dlg-user')?.close();
        renderUsers(adminUsers);
    }
});

/* ---- deactivate + reset pw ---- */
async function deactivateUser(userId) {
    if (!confirm('Deactivate this user?')) return;
    const targetUser = adminUsers.find(user => String(user.id) === String(userId));
    if (targetUser) targetUser.status = 'Deactivated';
    flash(document.getElementById('users-msg'), 'User deactivated (mock) ✅', true);
    renderUsers(adminUsers);
}
async function resetPassword(userId) {
    flash(document.getElementById('users-msg'), 'Password reset (mock) ✅', true);
}

/* ----------------- Transactions & Logs stubs ----------------- */
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

/* ----------------- Login ----------------- */
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

/* ----------------- Initial ----------------- */
showPanel('login');
