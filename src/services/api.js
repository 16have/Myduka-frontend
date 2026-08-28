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
    user: { ...data.user, name: data.user.username }, // backend has no `name` field yet — using username as display name
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

export async function acceptInvite(token, username, password) {
  return apiRequest("/accounts/invites/accept/", {
    method: "POST",
    body: JSON.stringify({ token, username, password }),
  });
}

// --- NOT YET IMPLEMENTED ON BACKEND — stubbed to fail loudly rather than silently ---
export async function listInvitations() {
  throw new Error("listInvitations: backend endpoint not implemented yet.");
}
export async function listAdmins() {
  throw new Error("listAdmins: backend endpoint not implemented yet.");
}
export async function deactivateAdmin() {
  throw new Error("deactivateAdmin: backend endpoint not implemented yet.");
}
export async function activateAdmin() {
  throw new Error("activateAdmin: backend endpoint not implemented yet.");
}
export async function deleteAdmin() {
  throw new Error("deleteAdmin: backend endpoint not implemented yet.");
}
export async function listClerks() {
  throw new Error("listClerks: backend endpoint not implemented yet.");
}
export async function deactivateClerk() {
  throw new Error("deactivateClerk: backend endpoint not implemented yet.");
}
export async function activateClerk() {
  throw new Error("activateClerk: backend endpoint not implemented yet.");
}
export async function deleteClerk() {
  throw new Error("deleteClerk: backend endpoint not implemented yet.");
}