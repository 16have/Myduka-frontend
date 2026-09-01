import { apiRequest } from "./api";

/* ------------------------------ Inventory ------------------------------ */

export function getInventory() {
  return apiRequest("/products/");
}

export function getInventoryItem(id) {
  return apiRequest(`/products/${id}/`);
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

export function updateSupplyRequest(id, payload) {
  return apiRequest(`/supply-requests/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
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
export function getInventoryStats() {
  return apiRequest("/reports/dashboard-summary/");
}