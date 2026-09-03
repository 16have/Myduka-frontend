// Colored badge for all module statuses.
// Handles both snake_case (in_stock) and Title Case (In Stock) from the backend.
const LABEL_MAP = {
  "in_stock":     "In Stock",
  "low_stock":    "Low Stock",
  "out_of_stock": "Out of Stock",
  "paid":         "Paid",
  "unpaid":       "Not Paid",
  "pending":      "Pending",
  "approved":     "Approved",
  "declined":     "Declined",
  "ordered":      "Ordered",
  "received":     "Received",
};

const CLASS_MAP = {
  "in_stock":     "badge--in-stock",
  "low_stock":    "badge--low-stock",
  "out_of_stock": "badge--out-of-stock",
  "paid":         "badge--paid",
  "unpaid":       "badge--not-paid",
  "pending":      "badge--pending",
  "approved":     "badge--approved",
  "declined":     "badge--declined",
  "ordered":      "badge--pending",
  "received":     "badge--approved",
};

export default function StatusBadge({ status }) {
  // Normalise: "In Stock" → "in_stock", "Not Paid" → "unpaid"
  const raw = String(status || "");
  const key = raw.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  const label = LABEL_MAP[key] ?? raw;
  const cls = CLASS_MAP[key] ?? "badge--default";
  return <span className={`badge ${cls}`}>{label}</span>;
}
