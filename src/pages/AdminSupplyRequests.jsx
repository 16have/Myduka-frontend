import { useEffect, useState } from "react";
import { getSupplyRequests, updateSupplyRequest } from "../services/inventoryApi";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import BackButton from "../components/BackButton";
import "../styles/tables.css";
import "../styles/supply-request.css";

const STATUS_OPTIONS = ["Pending", "Approved", "Declined", "Ordered", "Received"];

export default function AdminSupplyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  // per-row response text for quick approve/decline
  const [responses, setResponses] = useState({});
  // full edit mode
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: "", reason: "", notes: "", status: "Pending", admin_response: "" });

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setRequests(await getSupplyRequests());
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 5000);
    return () => clearInterval(interval);
  }, []);

  async function decide(id, status) {
    setUpdatingId(id);
    setActionError(null);
    try {
      const updated = await updateSupplyRequest(id, {
        status,
        admin_response: responses[id]?.trim() || "",
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      // clear the response input for this row
      setResponses((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  function startEdit(req) {
    setEditingId(req.id);
    setEditForm({
      quantity: String(req.quantity),
      reason: req.reason || "",
      notes: req.notes || "",
      status: req.status,
      admin_response: req.admin_response || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id) {
    const quantity = Number(editForm.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0 || !editForm.reason.trim()) {
      setActionError("Enter a positive whole quantity and a reason before saving.");
      return;
    }
    setUpdatingId(id);
    setActionError(null);
    try {
      const updated = await updateSupplyRequest(id, {
        quantity_requested: quantity,
        reason: editForm.reason.trim(),
        notes: editForm.notes.trim() || "",
        status: editForm.status,
        admin_response: editForm.admin_response.trim() || "",
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      cancelEdit();
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
        <BackButton to="/admin" />
        <h1>Supply Requests</h1>
        <p className="page-subtitle">Review, approve or decline clerk requests. Clerks see your response instantly.</p>
      </header>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      {requests.length === 0 ? (
        <EmptyState title="No supply requests" message="Requests submitted by clerks will appear here." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Requested By</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Admin Response</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td data-label="#">{r.id}</td>
                  <td data-label="Requested By">{r.requested_by_name}</td>
                  <td data-label="Product">{r.product_name}</td>

                  <td data-label="Qty">
                    {editingId === r.id
                      ? <input className="response-input" type="number" min="1" value={editForm.quantity}
                          onChange={(e) => setEditForm((f) => ({ ...f, quantity: e.target.value }))} />
                      : r.quantity}
                  </td>

                  <td data-label="Reason">
                    {editingId === r.id
                      ? <input className="response-input" type="text" value={editForm.reason}
                          onChange={(e) => setEditForm((f) => ({ ...f, reason: e.target.value }))} />
                      : r.reason}
                  </td>

                  <td data-label="Notes">
                    {editingId === r.id
                      ? <input className="response-input" type="text" value={editForm.notes}
                          onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} />
                      : (r.notes || "—")}
                  </td>

                  <td data-label="Status">
                    {editingId === r.id
                      ? <select className="response-input" value={editForm.status}
                          onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      : <StatusBadge status={r.status} />}
                  </td>

                  <td data-label="Admin Response">
                    {editingId === r.id
                      ? <input className="response-input" type="text" value={editForm.admin_response}
                          onChange={(e) => setEditForm((f) => ({ ...f, admin_response: e.target.value }))} />
                      : (r.admin_response || "—")}
                  </td>

                  <td data-label="Date">{new Date(r.created_at).toLocaleString()}</td>

                  <td data-label="Actions" className="supply-actions">
                    {editingId === r.id ? (
                      <>
                        <button className="btn btn-primary btn-sm" disabled={updatingId === r.id} onClick={() => saveEdit(r.id)}>Save</button>
                        <button className="btn btn-outline btn-sm" onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        {/* Response input shown for Pending rows */}
                        {r.status === "Pending" && (
                          <input
                            className="response-input"
                            type="text"
                            placeholder="Optional response..."
                            value={responses[r.id] || ""}
                            onChange={(e) => setResponses((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          />
                        )}

                        {r.status === "Pending" && (
                          <>
                            <button className="btn btn-primary btn-sm" disabled={updatingId === r.id}
                              onClick={() => decide(r.id, "Approved")}>
                              {updatingId === r.id ? "..." : "Approve"}
                            </button>
                            <button className="btn btn-danger btn-sm" disabled={updatingId === r.id}
                              onClick={() => decide(r.id, "Declined")}>
                              {updatingId === r.id ? "..." : "Decline"}
                            </button>
                          </>
                        )}

                        {r.status === "Approved" && (
                          <button className="btn btn-primary btn-sm" disabled={updatingId === r.id}
                            onClick={() => decide(r.id, "Ordered")}>
                            {updatingId === r.id ? "..." : "Mark Ordered"}
                          </button>
                        )}

                        {r.status === "Ordered" && (
                          <button className="btn btn-primary btn-sm" disabled={updatingId === r.id}
                            onClick={() => decide(r.id, "Received")}>
                            {updatingId === r.id ? "..." : "Mark Received"}
                          </button>
                        )}

                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(r)}>Update</button>
                      </>
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
