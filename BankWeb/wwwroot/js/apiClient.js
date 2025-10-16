export const USE_MOCK = true; // flip to false when backend is ready
const BASE_URL = USE_MOCK ? '/mock' : '/api';

async function httpGet(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    return res.json();
}

export async function getMe() {
    return USE_MOCK ? httpGet(`${BASE_URL}/me.json`) : httpGet(`${BASE_URL}/users/me`);
}

export async function updateMe(payload) {
    if (USE_MOCK) return { ok: true };
    const res = await fetch(`${BASE_URL}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`PUT /users/me → ${res.status}`);
    return { ok: true };
}

export async function getAccounts() {
    return USE_MOCK ? httpGet(`${BASE_URL}/accounts.json`) : httpGet(`${BASE_URL}/accounts`);
}

export async function getTransactions(accountId, from, to) {
    if (USE_MOCK) {
        return httpGet(`${BASE_URL}/transactions-${accountId}.json`);
    }
    const qs = new URLSearchParams({ from: from || '', to: to || '' }).toString();
    return httpGet(`${BASE_URL}/accounts/${accountId}/transactions?${qs}`);
}

export async function createTransfer(payload) {
    if (USE_MOCK) return { id: Date.now(), ...payload };
    const res = await fetch(`${BASE_URL}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`POST /transfers → ${res.status}`);
    return res.json();
}
