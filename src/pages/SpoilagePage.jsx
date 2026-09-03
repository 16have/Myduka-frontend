import { useEffect, useState } from "react";
import { getInventory, getSpoilage, recordSpoilage } from "../services/inventoryApi";
import { useAuth } from "@/lib/auth";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import BackButton from "../components/BackButton";
import "../styles/forms.css";
import "../styles/spoilage.css";
import "../styles/tables.css";

const REASONS = ["Broken", "Expired", "Other"];

const EMPTY_FORM = {
  product_id: "",
  quantity: "",
  reason: "Broken",
  notes: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function SpoilagePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [inventory, spoilage] = await Promise.all([getInventory(), getSpoilage()]);
        setProducts(inventory);
        setRecords(spoilage);
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedProduct = products.find(
    (p) => p.id === Number(form.product_id)
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFormErrors((errs) => ({ ...errs, [name]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.product_id) errs.product_id = "Please select a product.";
    if (!form.quantity || Number(form.quantity) <= 0) {
      errs.quantity = "Quantity must be greater than zero.";
    } else if (
      selectedProduct &&
      Number(form.quantity) > selectedProduct.current_stock
    ) {
      errs.quantity = `Only ${selectedProduct.current_stock} unit(s) available.`;
    }
    if (!REASONS.includes(form.reason)) errs.reason = "Invalid reason.";
    if (!form.date) errs.date = "Please choose a date.";
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
        quantity_spoiled: Number(form.quantity),
        reason: form.reason,
        notes: form.notes.trim() || "",
        date: form.date,
      };
      const result = await recordSpoilage(payload, user.id);
      setRecords(await getSpoilage());
      setSuccess(
        `Spoilage recorded. ${selectedProduct?.name} stock is now ${result.new_stock_level}.`
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.id === payload.product_id
            ? { ...p, current_stock: result.new_stock_level }
            : p
        )
      );
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading products..." />;
  if (loadError) return <ErrorMessage message={loadError} />;

  return (
    <div className="page">
      <header className="page-header">
        <BackButton to="/clerk" />
        <h1>Record Spoilage</h1>
        <p className="page-subtitle">
          Spoiled items are deducted from stock immediately.
        </p>
      </header>

      <form className="form-card spoilage-form" onSubmit={handleSubmit} noValidate>
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
                  {p.name} (available: {p.current_stock})
                </option>
              ))}
            </select>
            {formErrors.product_id && (
              <span className="field-error">{formErrors.product_id}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity Spoiled *</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              max={selectedProduct?.current_stock || undefined}
              value={form.quantity}
              onChange={handleChange}
            />
            {formErrors.quantity && (
              <span className="field-error">{formErrors.quantity}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reason">Reason *</label>
            <select
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {formErrors.reason && (
              <span className="field-error">{formErrors.reason}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
            {formErrors.date && (
              <span className="field-error">{formErrors.date}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            placeholder="e.g. crate dropped during offloading"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <button
          className="btn btn-danger"
          type="submit"
          disabled={submitting || (selectedProduct && selectedProduct.current_stock === 0)}
        >
          {submitting ? "Saving..." : "Record Spoilage"}
        </button>
      </form>

      <section className="spoilage-history">
        <div className="spoilage-history-heading">
          <div>
            <h2>Recorded spoilage</h2>
            <p>Keep a visible audit trail of broken, expired, and discarded stock.</p>
          </div>
          <strong>{records.length} record{records.length === 1 ? "" : "s"}</strong>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No spoilage recorded yet</p>
            <p className="empty-state-message">Submitted spoilage records will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Notes</th>
                  <th>Recorded by</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td data-label="Product">{record.product_name}</td>
                    <td data-label="Quantity">{record.quantity}</td>
                    <td data-label="Reason">{record.reason}</td>
                    <td data-label="Notes">{record.notes || "—"}</td>
                    <td data-label="Recorded by">{record.clerk_name}</td>
                    <td data-label="Date">{record.date ? new Date(record.date).toLocaleDateString() : new Date(record.created_at).toLocaleDateString()}</td>
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
