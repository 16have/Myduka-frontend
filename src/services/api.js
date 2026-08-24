// Low-level fetch wrapper. All API calls in the app go through here,
// so headers, error handling and JSON parsing stay consistent.

import { API_URL } from "../../config";

/**
 * Perform an API request.
 * @param {string} path   - path relative to API_URL, e.g. "/inventory"
 * @param {object} options - fetch options (method, body, headers...)
 * @returns {Promise<any>} parsed "data" field from the backend envelope
 */
export async function apiRequest(path, options = {}) {
  const url = `${API_URL}${path}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    // Backend unreachable / CORS / offline
    throw new Error("Cannot reach the MyDuka server. Is the Flask backend running?", {
      cause: networkError,
    });
  }

  let payload;
  try {
    payload = await response.json();
  } catch (parseError) {
    throw new Error(`Server returned an invalid response (HTTP ${response.status}).`, {
      cause: parseError,
    });
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed (HTTP ${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.errors = payload?.errors || null;
    throw error;
  }

  // Backend envelope: { success: true, data: ... }
  return payload.data;
}
