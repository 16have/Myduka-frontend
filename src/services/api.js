import { API_URL } from "../../config";

const SESSION_KEY = "myduka_session";

function getToken() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw).access_token;
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const url = `${API_URL}${path}`;
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error("Cannot reach the MyDuka server. Is the Django backend running?");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.detail || payload?.message || `Request failed (HTTP ${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.errors = payload || null;
    throw error;
  }

  return payload;
}
