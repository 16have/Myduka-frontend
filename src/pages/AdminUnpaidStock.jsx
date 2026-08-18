import { useEffect, useState } from "react";
import { getUnpaidPayments, updatePaymentStatus } from "../services/inventoryApi";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import WhatsAppFallback from "../components/WhatsAppFallback";
import "../styles/tables.css";
import "../styles/payment.css";

export default function AdminUnpaidStock() {
  const { currentUser } = useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  // Which transaction the admin wants to follow up on via WhatsApp.
  const [whatsappRow, setWhatsappRow] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRows(await getUnpaidPayments());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAsPaid(id) {
    setUpdatingId(id);
    setActionError(null);
    try {
      const updated = await updatePaymentStatus(id, "Paid", currentUser.id);
      // Remove from the unpaid list once the backend confirms the change.
      setRows((prev) => prev.filter((r) => r.id !== updated.id));
      if (whatsappRow?.id === id) setWhatsappRow(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <LoadingSpinner message="Loading unpaid stock..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Unpaid Stock &amp; Payment Management</h1>
        <p className="page-subtitle">
          Transactions awaiting payment. Mark them Paid once money is received.
        </p>
      </header>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      {rows.length === 0 ? (
        <EmptyState
          title="No unpaid stock"
          message="All received stock has been paid for. Great job!"
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount Owed</th>
                <th>Supplier</th>
                <th>Recorded By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td data-label="Reference">{r.reference_number}</td>
                  <td data-label="Product">{r.product_name}</td>
                  <td data-label="Qty">{r.quantity}</td>
                  <td data-label="Amount Owed">
                    KES {Number(r.total_amount).toLocaleString()}
                  </td>
                  <td data-label="Supplier">{r.supplier || "—"}</td>
                  <td data-label="Recorded By">{r.clerk_name}</td>
                  <td data-label="Status">
                    <StatusBadge status={r.payment_status} />
                  </td>
                  <td data-label="Actions" className="payment-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={updatingId === r.id}
                      onClick={() => markAsPaid(r.id)}
                    >
                      {updatingId === r.id ? "Updating..." : "Mark as Paid"}
                    </button>
                    <button
                      className="btn btn-whatsapp btn-sm"
                      onClick={() =>
                        setWhatsappRow(whatsappRow?.id === r.id ? null : r)
                      }
                    >
                      WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {whatsappRow && (
        <WhatsAppFallback
          referenceNumber={whatsappRow.reference_number}
          product={whatsappRow.product_name}
          amount={whatsappRow.total_amount}
          userName={currentUser.name}
          paymentStatus={whatsappRow.payment_status}
          issue="Following up on unpaid supplier stock"
        />
      )}
    </div>
  );
}
