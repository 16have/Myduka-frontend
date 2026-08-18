// Service layer for the inventory module.
// React components NEVER call fetch directly — they use these functions.

import { apiRequest } from "./api";
import { demoApi } from "./demoData";

// Demo mode is enabled ONLY via VITE_DEMO_MODE=true (used by the static
// preview where no backend exists). In normal development this is false
// and every function below talks to the real Flask API.
const DEMO = import.meta.env.VITE_DEMO_MODE === "true";

// Sends the logged-in user's id so the backend can record WHO did each action.
// When your group wires in real auth, replace this header with the auth token.
function withUser(userId) {
  return { headers: { "X-User-Id": String(userId) } };
}

/* ------------------------------ Inventory ------------------------------ */

export function getInventory() {
  return DEMO ? demoApi.getInventory() : apiRequest("/inventory");
}

export function getInventoryItem(id) {
  return apiRequest(`/inventory/${id}`);
}

export function getInventoryStats() {
  return DEMO ? demoApi.getInventoryStats() : apiRequest("/inventory/stats");
}

/* --------------------------- Receiving stock ---------------------------- */

export function receiveStock(payload, userId) {
  if (DEMO) return demoApi.receiveStock(payload);
  return apiRequest("/stock/receive", {
    method: "POST",
    body: JSON.stringify(payload),
    ...withUser(userId),
  });
}

export function getReceivedStock() {
  return DEMO ? demoApi.getReceivedStock() : apiRequest("/stock/received");
}

/* ------------------------------ Spoilage -------------------------------- */

export function recordSpoilage(payload, userId) {
  if (DEMO) return demoApi.recordSpoilage(payload);
  return apiRequest("/spoilage", {
    method: "POST",
    body: JSON.stringify(payload),
    ...withUser(userId),
  });
}

export function getSpoilage() {
  return apiRequest("/spoilage");
}

/* --------------------------- Supply requests ---------------------------- */

export function createSupplyRequest(payload, userId) {
  if (DEMO) return demoApi.createSupplyRequest(payload);
  return apiRequest("/supply-requests", {
    method: "POST",
    body: JSON.stringify(payload),
    ...withUser(userId),
  });
}

export function getSupplyRequests(userId = null) {
  if (DEMO) return demoApi.getSupplyRequests();
  // Clerks see only their own requests; admins see all.
  const query = userId ? `?requested_by=${userId}` : "";
  return apiRequest(`/supply-requests${query}`);
}

export function updateSupplyRequest(id, payload, userId) {
  if (DEMO) return demoApi.updateSupplyRequest(id, payload);
  return apiRequest(`/supply-requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...withUser(userId),
  });
}

/* ------------------------------ Payments -------------------------------- */

export function getUnpaidPayments() {
  return DEMO ? demoApi.getUnpaidPayments() : apiRequest("/payments/unpaid");
}

export function updatePaymentStatus(id, status, userId) {
  if (DEMO) return demoApi.updatePaymentStatus(id, status);
  return apiRequest(`/payments/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ payment_status: status }),
    ...withUser(userId),
  });
}
