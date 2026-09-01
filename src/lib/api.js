import { apiRequest } from "@/services/api";

export const API_BASE_URL = "/api";
const SESSION_KEY = "myduka_session";

function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function login(email, password) {
  const data = await apiRequest("/token/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const session = {
    access_token: data.access,
    refresh_token: data.refresh,
    user: { ...data.user, name: data.user.username }, // no `name` field on backend User model yet — using username as display name
  };
  saveSession(session);
  return session;
}

export async function logout() {
  saveSession(null);
}

export async function me() {
  const session = getSession();
  if (!session) throw new Error("Not authenticated.");
  return session.user;
}

export async function registerMerchant(payload) {
  // payload: { username, email, password, store_name, store_location, store_phone, store_email }
  return apiRequest("/accounts/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function inviteAdmin(email, storeId) {
  return apiRequest("/accounts/invites/", {
    method: "POST",
    body: JSON.stringify({ email, store_id: storeId, role: "admin" }),
  });
}

export async function inviteClerk(email, storeId) {
  return apiRequest("/accounts/invites/", {
    method: "POST",
    body: JSON.stringify({ email, store_id: storeId, role: "clerk" }),
  });
}

export async function validateInvitation(token) {
  return apiRequest(`/accounts/invites/validate/?token=${encodeURIComponent(token)}`);
}

export async function acceptInvite(token, username, password) {
  return apiRequest("/accounts/invites/accept/", {
    method: "POST",
    body: JSON.stringify({ token, username, password }),
  });
}

export async function listInvitations(storeId) {
  return apiRequest(`/accounts/invites/pending/?store_id=${storeId}`);
}

export async function listAdmins(storeId) {
  return apiRequest(`/accounts/members/?store_id=${storeId}&role=admin`);
}

export async function listClerks(storeId) {
  return apiRequest(`/accounts/members/?store_id=${storeId}&role=clerk`);
}

export async function deactivateAdmin(membershipId) {
  return apiRequest(`/accounts/members/${membershipId}/toggle-active/`, { method: "POST" });
}

export async function activateAdmin(membershipId) {
  return apiRequest(`/accounts/members/${membershipId}/toggle-active/`, { method: "POST" });
}

export async function deleteAdmin(membershipId) {
  return apiRequest(`/accounts/members/${membershipId}/`, { method: "DELETE" });
}

export async function deactivateClerk(membershipId) {
  return apiRequest(`/accounts/members/${membershipId}/toggle-active/`, { method: "POST" });
}

export async function activateClerk(membershipId) {
  return apiRequest(`/accounts/members/${membershipId}/toggle-active/`, { method: "POST" });
}

export async function deleteClerk(membershipId) {
  return apiRequest(`/accounts/members/${membershipId}/`, { method: "DELETE" });
}
