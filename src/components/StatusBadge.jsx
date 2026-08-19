// Colored badge for all module statuses:
// Paid, Not Paid, Pending, Approved, Declined, In Stock, Low Stock, Out of Stock.
export default function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase().replace(/\s+/g, "-");

  const classMap = {
    paid: "badge--paid",
    "not-paid": "badge--not-paid",
    pending: "badge--pending",
    approved: "badge--approved",
    declined: "badge--declined",
    "in-stock": "badge--in-stock",
    "low-stock": "badge--low-stock",
    "out-of-stock": "badge--out-of-stock",
  };

  return (
    <span className={`badge ${classMap[key] || "badge--default"}`}>{status}</span>
  );
}
