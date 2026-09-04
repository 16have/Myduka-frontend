/**
 * MyDuka — Authentication & User Management API layer
 * Connects to the real Django backend via fetch().
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const SESSION_KEY = 'myduka_session'

// ─── Session helpers ────────────────────────────────────────────────────────

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

function getToken() {
  return getSession()?.access_token ?? null
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = getToken()
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, config)
  } catch {
    throw new Error('Cannot reach the MyDuka server. Is the Django backend running?')
  }

  // 204 No Content — nothing to parse
  if (response.status === 204) return null

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.message ||
      (typeof payload === 'object' && payload !== null
        ? Object.values(payload).flat().join(' ')
        : null) ||
      `Request failed (HTTP ${response.status}).`
    const err = new Error(message)
    err.status = response.status
    err.errors = payload
    throw err
  }

  return payload
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const data = await request('/token/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  // Backend returns: { access, refresh, user: { id, username, email, role, is_active, store_id, store_name } }
  const session = {
    access_token: data.access,
    refresh_token: data.refresh,
    user: data.user,
  }
  saveSession(session)
  return session
}

export async function logout() {
  saveSession(null)
}

export async function me() {
  return request('/accounts/members/me/')
}

// ─── Invitations ─────────────────────────────────────────────────────────────

export async function inviteAdmin(email, store_id) {
  return request('/accounts/invites/', {
    method: 'POST',
    body: JSON.stringify({ email, store_id, role: 'admin', expires_in_hours: 1 }),
  })
}

export async function inviteClerk(email, store_id) {
  return request('/accounts/invites/', {
    method: 'POST',
    body: JSON.stringify({ email, store_id, role: 'clerk', expires_in_hours: 1 }),
  })
}

export async function listInvitations(store_id, role) {
  const roleQuery = role ? `&role=${encodeURIComponent(role)}` : ''
  return request(`/accounts/invites/pending/?store_id=${store_id}${roleQuery}`)
}

export async function deleteInvitation(invitation_id) {
  return request(`/accounts/invites/${invitation_id}/`, { method: 'DELETE' })
}

export async function validateInvitation(token) {
  return request(`/accounts/invites/validate/?token=${token}`)
}

export async function registerAdmin(token, name, password) {
  return request('/accounts/invites/accept/', {
    method: 'POST',
    body: JSON.stringify({ token, username: name, password }),
  })
}

export async function acceptInvite(token, username, password) {
  return request('/accounts/invites/accept/', {
    method: 'POST',
    body: JSON.stringify({ token, username, password }),
  })
}

// ─── Admins (store members with role=admin) ───────────────────────────────────

export async function listAdmins(store_id) {
  return request(`/accounts/members/?store_id=${store_id}&role=admin`)
}

export async function activateAdmin(membership_id) {
  return request(`/accounts/members/${membership_id}/toggle-active/`, { method: 'POST' })
}

export async function deactivateAdmin(membership_id) {
  return request(`/accounts/members/${membership_id}/toggle-active/`, { method: 'POST' })
}

export async function deleteAdmin(membership_id) {
  return request(`/accounts/members/${membership_id}/`, { method: 'DELETE' })
}

// ─── Clerks (store members with role=clerk) ───────────────────────────────────

export async function listClerks(store_id) {
  return request(`/accounts/members/?store_id=${store_id}&role=clerk`)
}

export async function activateClerk(membership_id) {
  return request(`/accounts/members/${membership_id}/toggle-active/`, { method: 'POST' })
}

export async function deactivateClerk(membership_id) {
  return request(`/accounts/members/${membership_id}/toggle-active/`, { method: 'POST' })
}

export async function deleteClerk(membership_id) {
  return request(`/accounts/members/${membership_id}/`, { method: 'DELETE' })
}
