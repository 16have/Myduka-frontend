import { useEffect, useState } from "react";
import {
  getInventory,
  createSupplyRequest,
  getSupplyRequests,
} from "../services/inventoryApi";
import { useAuth } from "@/lib/auth";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import BackButton from "../components/BackButton";
import "../styles/forms.css";
import "../styles/tables.css";
import "../styles/supply-request.css";

const EMPTY_FORM = { product_id: "", quantity: "", reason: "", notes: "" };

export default function SupplyRequestPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const [productData, requestData] = await Promise.all([
        getInventory(),
        getSupplyRequests(),
      ]);
      setProducts(productData);
      setRequests(requestData);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user.id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFormErrors((errs) => ({ ...errs, [name]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.product_id) errs.product_id = "Please select a product.";
    if (!form.quantity || Number(form.quantity) <= 0)
      errs.quantity = "Quantity must be greater than zero.";
    if (!form.reason.trim()) errs.reason = "Please give a reason.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(null);
    setSubmitError(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        reason: form.reason.trim(),
        notes: form.notes.trim() || null,
      };
      const created = await createSupplyRequest(payload, user.id);
      setRequests((prev) => [created, ...prev]);
      setSuccess(`Supply request #${created.id} submitted (status: Pending).`);
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading..." />;
  if (loadError) return <ErrorMessage message={loadError} onRetry={load} />;

  return (
    <div className="page">
      <header className="page-header">
        <BackButton to="/clerk" />
        <h1>Supply Requests</h1>
        <p className="page-subtitle">
          Ask the admin to order more stock. New requests start as Pending.
        </p>
      </header>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {success && <div className="alert alert-success">{success}</div>}
        {submitError && <div className="alert alert-error">{submitError}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="product_id">Product *</label>
            <select
              id="product_id"
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
            >
              <option value="">— Select product —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (current: {p.current_stock})
                </option>
              ))}
            </select>
            {formErrors.product_id && (
              <span className="field-error">{formErrors.product_id}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Requested Quantity *</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
            />
            {formErrors.quantity && (
              <span className="field-error">{formErrors.quantity}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason *</label>
          <input
            id="reason"
            name="reason"
            type="text"
            placeholder="e.g. Running low ahead of the weekend"
            value={form.reason}
            onChange={handleChange}
          />
          {formErrors.reason && (
            <span className="field-error">{formErrors.reason}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows="2"
            placeholder="Optional"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      <section className="request-list-section">
        <h2>All Supply Requests</h2>
        {requests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            message="Supply requests will appear here."
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin Response</th>
                  <th>Requested By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td data-label="#">{req.id}</td>
                    <td data-label="Product">{req.product_name}</td>
                    <td data-label="Quantity">{req.quantity}</td>
                    <td data-label="Reason">{req.reason}</td>
                    <td data-label="Status">
                      <StatusBadge status={req.status} />
                    </td>
                    <td data-label="Admin Response">
                      {req.admin_response || "—"}
                    </td>
                    <td data-label="Requested By">{req.requested_by_name}</td>
                    <td data-label="Date">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
