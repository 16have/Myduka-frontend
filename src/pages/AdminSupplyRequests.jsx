import { useEffect, useState } from "react";
import {
  getSupplyRequests,
  updateSupplyRequest,
} from "../services/inventoryApi";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import "../styles/tables.css";
import "../styles/supply-request.css";

export default function AdminSupplyRequests() {
  const { currentUser } = useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [responses, setResponses] = useState({}); // id -> admin response text

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRequests(await getSupplyRequests()); // admin: all requests
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id, status) {
    setUpdatingId(id);
    setActionError(null);
    try {
      const updated = await updateSupplyRequest(
        id,
        { status, admin_response: responses[id]?.trim() || null },
        currentUser.id
      );
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <LoadingSpinner message="Loading supply requests..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Supply Requests</h1>
        <p className="page-subtitle">
          Approve or decline clerk requests, with an optional response.
        </p>
      </header>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      {requests.length === 0 ? (
        <EmptyState
          title="No supply requests"
          message="Requests submitted by clerks will appear here."
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Requested By</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Response</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td data-label="#">{r.id}</td>
                  <td data-label="Product">{r.product_name}</td>
                  <td data-label="Qty">{r.quantity}</td>
                  <td data-label="Requested By">{r.requested_by_name}</td>
                  <td data-label="Reason">{r.reason}</td>
                  <td data-label="Status">
                    <StatusBadge status={r.status} />
                  </td>
                  <td data-label="Admin Response">
                    {r.status === "Pending" ? (
                      <input
                        className="response-input"
                        type="text"
                        placeholder="Optional note..."
                        value={responses[r.id] || ""}
                        onChange={(e) =>
                          setResponses((prev) => ({
                            ...prev,
                            [r.id]: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      r.admin_response || "—"
                    )}
                  </td>
                  <td data-label="Actions" className="payment-actions">
                    {r.status === "Pending" ? (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={updatingId === r.id}
                          onClick={() => decide(r.id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={updatingId === r.id}
                          onClick={() => decide(r.id, "Declined")}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className="decided-label">Decided</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
