// Demo data — used ONLY when VITE_DEMO_MODE=true (e.g. the static preview,
// where no Flask backend exists). Local development uses the real API.
// It mimics the exact response shapes of the Flask endpoints.

// Demo users — matches AppContext.jsx demo users.
const USERS = {
  1: { id: 1, name: "admin", role: "admin" },
  2: { id: 2, name: "kosh", role: "clerk" },
  3: { id: 3, name: "Grace", role: "clerk" },
  4: { id: 4, name: "John", role: "clerk" },
};

function getUser(userId) {
  return USERS[userId] || { id: userId, name: `User ${userId}`, role: "clerk" };
}

let products = [
  { id: 1, name: "Maize Flour 2kg", category: "Flour", buying_price: 140, selling_price: 180, current_stock: 45, minimum_stock_level: 10, updated_at: new Date().toISOString() },
  { id: 2, name: "Sugar 1kg", category: "Baking", buying_price: 120, selling_price: 155, current_stock: 8, minimum_stock_level: 15, updated_at: new Date().toISOString() },
  { id: 3, name: "Cooking Oil 1L", category: "Oils", buying_price: 280, selling_price: 340, current_stock: 0, minimum_stock_level: 5, updated_at: new Date().toISOString() },
  { id: 4, name: "Rice 5kg", category: "Grains", buying_price: 620, selling_price: 750, current_stock: 22, minimum_stock_level: 6, updated_at: new Date().toISOString() },
];

let transactions = [
  { id: 1, reference_number: "RCV-0001", product_name: "Maize Flour 2kg", quantity: 30, buying_price: 140, selling_price: 180, supplier: "kosh wholesalers", payment_status: "Paid", clerk_name: "kosh", total_amount: 4200, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, reference_number: "RCV-0002", product_name: "Sugar 1kg", quantity: 20, buying_price: 120, selling_price: 155, supplier: "kosh wholesalers", payment_status: "Not Paid", clerk_name: "kosh", total_amount: 2400, created_at: new Date(Date.now() - 86400000).toISOString() },
];

let supplyRequests = [
  { id: 1, product_name: "Cooking Oil 1L", product_id: 3, quantity: 24, reason: "Out of stock", notes: null, status: "Pending", admin_response: null, requested_by_id: 2, requested_by_name: "kosh", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, product_name: "Maize Flour 2kg", product_id: 1, quantity: 50, reason: "Weekend promotion", notes: "Urgent restock needed", status: "Pending", admin_response: null, requested_by_id: 3, requested_by_name: "Grace", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, product_name: "Sugar 1kg", product_id: 2, quantity: 30, reason: "Low stock", notes: null, status: "Approved", admin_response: "Order placed with supplier", requested_by_id: 4, requested_by_name: "John", created_at: new Date(Date.now() - 43200000).toISOString() },
  { id: 4, product_name: "Rice 5kg", product_id: 4, quantity: 15, reason: "New product line", notes: "First batch", status: "Declined", admin_response: "Not in budget", requested_by_id: 2, requested_by_name: "kosh", created_at: new Date(Date.now() - 3600000).toISOString() },
];

let spoilage = [
  { id: 1, product_name: "Maize Flour 2kg", product_id: 1, quantity: 5, reason: "Expired", notes: "Batch expired", clerk_name: "kosh", date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 2, product_name: "Sugar 1kg", product_id: 2, quantity: 2, reason: "Broken", notes: "Bag torn", clerk_name: "kosh", date: new Date(Date.now() - 86400000).toISOString() },
];

let nextTxnId = 3;
let nextReqId = 5;
let nextSpoilageId = 3;

function stockStatus(p) {
  if (p.current_stock === 0) return "Out of Stock";
  if (p.current_stock <= p.minimum_stock_level) return "Low Stock";
  return "In Stock";
}

export const demoApi = {
  getInventory: async () =>
    products.map((p) => ({ ...p, stock_status: stockStatus(p) })),

  getInventoryItem: async (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) throw new Error("Product not found.");
    return { ...p, stock_status: stockStatus(p) };
  },

  getInventoryStats: async () => ({
    total_products: products.length,
    total_stock: products.reduce((s, p) => s + p.current_stock, 0),
    low_stock: products.filter((p) => stockStatus(p) === "Low Stock").length,
    out_of_stock: products.filter((p) => p.current_stock === 0).length,
    unpaid_stock: transactions.filter((t) => t.payment_status === "Not Paid").length,
    pending_supply_requests: supplyRequests.filter((r) => r.status === "Pending").length,
  }),

  receiveStock: async (payload, userId) => {
    const p = products.find((x) => x.id === payload.product_id);
    p.current_stock += payload.quantity;
    p.buying_price = payload.buying_price;
    p.selling_price = payload.selling_price;
    p.updated_at = new Date().toISOString();
    const user = getUser(userId);
    const txn = {
      id: nextTxnId,
      reference_number: `RCV-${String(nextTxnId).padStart(4, "0")}`,
      product_name: p.name,
      quantity: payload.quantity,
      buying_price: payload.buying_price,
      selling_price: payload.selling_price,
      supplier: payload.supplier,
      payment_status: payload.payment_status,
      clerk_name: user.name,
      total_amount: payload.quantity * payload.buying_price,
      created_at: new Date().toISOString(),
    };
    nextTxnId += 1;
    transactions.unshift(txn);
    return { ...txn, new_stock_level: p.current_stock };
  },

  getReceivedStock: async () => transactions,

  recordSpoilage: async (payload, userId) => {
    const p = products.find((x) => x.id === payload.product_id);
    if (payload.quantity > p.current_stock) {
      throw new Error("Spoilage quantity exceeds available stock.");
    }
    p.current_stock -= payload.quantity;
    p.updated_at = new Date().toISOString();
    const user = getUser(userId);
    const record = {
      id: nextSpoilageId,
      product_id: p.id,
      product_name: p.name,
      quantity: payload.quantity,
      reason: payload.reason,
      notes: payload.notes,
      clerk_name: user.name,
      date: payload.date || new Date().toISOString(),
    };
    nextSpoilageId += 1;
    spoilage.unshift(record);
    return { id: record.id, new_stock_level: p.current_stock };
  },

  getSpoilage: async () => spoilage,

  createSupplyRequest: async (payload, userId) => {
    const p = products.find((x) => x.id === payload.product_id);
    const user = getUser(userId);
    const req = {
      id: nextReqId,
      product_id: p.id,
      product_name: p.name,
      quantity: payload.quantity,
      reason: payload.reason,
      notes: payload.notes,
      status: "Pending",
      admin_response: null,
      requested_by_id: user.id,
      requested_by_name: user.name,
      created_at: new Date().toISOString(),
    };
    nextReqId += 1;
    supplyRequests.unshift(req);
    return req;
  },

  getSupplyRequests: async (userId) => {
    if (!userId) return supplyRequests;
    return supplyRequests.filter((r) => r.requested_by_id === userId);
  },

  updateSupplyRequest: async (id, payload) => {
    const req = supplyRequests.find((r) => r.id === id);
    if (!req) throw new Error("Request not found.");
    if (payload.quantity !== undefined) req.quantity = payload.quantity;
    if (payload.reason !== undefined) req.reason = payload.reason;
    if (payload.notes !== undefined) req.notes = payload.notes;
    if (payload.status !== undefined) req.status = payload.status;
    if (payload.admin_response !== undefined) req.admin_response = payload.admin_response;
    return req;
  },

  getUnpaidPayments: async () =>
    transactions.filter((t) => t.payment_status === "Not Paid"),

  updatePaymentStatus: async (id, status) => {
    const txn = transactions.find((t) => t.id === id);
    txn.payment_status = status;
    return txn;
  },
};
