import { apiRequest } from "./api";

/* ------------------------------ Inventory ------------------------------ */

export function getInventory() {
  return apiRequest("/products/");
}

export function getInventoryItem(id) {
  return apiRequest(`/products/${id}/`);
}

export function getInventoryStats() {
  return apiRequest("/reports/stock-summary/");
}

/* --------------------------- Receiving stock ---------------------------- */

export function receiveStock(payload) {
  return apiRequest("/stock-receipts/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getReceivedStock() {
  return apiRequest("/stock-receipts/");
}

/* ------------------------------ Spoilage -------------------------------- */

export function recordSpoilage(payload) {
  return apiRequest("/spoilage/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSpoilage() {
  return apiRequest("/spoilage/");
}

/* --------------------------- Supply requests ---------------------------- */

export function createSupplyRequest(payload) {
  return apiRequest("/supply-requests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSupplyRequests() {
  return apiRequest("/supply-requests/");
}

export function approveSupplyRequest(id) {
  return apiRequest(`/supply-requests/${id}/approve/`, { method: "POST" });
}

export function rejectSupplyRequest(id) {
  return apiRequest(`/supply-requests/${id}/reject/`, { method: "POST" });
}

export function fulfillSupplyRequest(id) {
  return apiRequest(`/supply-requests/${id}/fulfill/`, { method: "POST" });
}

/* ------------------------------ Payments (unpaid stock) ------------------ */

export function getUnpaidPayments() {
  return apiRequest("/stock-receipts/?payment_status=unpaid");
}

export function updatePaymentStatus(id, status) {
  return apiRequest(`/stock-receipts/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status: status }),
  });
}