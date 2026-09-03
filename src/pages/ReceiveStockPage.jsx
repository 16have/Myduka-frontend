import { useEffect, useState } from "react";
import { getInventory, receiveStock } from "../services/inventoryApi";
import { useAuth } from "@/lib/auth";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import WhatsAppFallback from "../components/WhatsAppFallback";
import BackButton from "../components/BackButton";
import "../styles/forms.css";

const EMPTY_FORM = {
  product_id: "",
  quantity: "",
  buying_price: "",
  selling_price: "",
  supplier: "",
  payment_status: "Not Paid",
  date_received: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function ReceiveStockPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getInventory();
        setProducts(data);
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoadingProducts(false);
      }
    }
    load();
  }, []);

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
    if (form.buying_price === "" || Number(form.buying_price) < 0)
      errs.buying_price = "Buying price cannot be negative.";
    if (form.selling_price === "" || Number(form.selling_price) < 0)
      errs.selling_price = "Selling price cannot be negative.";
    if (!["Paid", "Not Paid"].includes(form.payment_status))
      errs.payment_status = "Invalid payment status.";
    if (!form.date_received) errs.date_received = "Please choose a date.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(null);
    setSubmitError(null);
    setLastTransaction(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product_id: Number(form.product_id),
        quantity_received: Number(form.quantity),
        unit_cost: Number(form.buying_price),
        selling_price: Number(form.selling_price) || undefined,
        supplier_name: form.supplier.trim() || "",
        payment_status: form.payment_status,
        date_received: form.date_received,
        notes: form.notes.trim() || "",
      };
      const transaction = await receiveStock(payload, user.id);
      const product = products.find((p) => p.id === payload.product_id);
      setSuccess(
        `Stock received successfully. Reference: ${transaction.reference_number}. New stock level: ${transaction.new_stock_level ?? "updated"}.`
      );
      if (payload.payment_status === "Not Paid") {
        setLastTransaction({ ...transaction, productName: product?.name });
      }
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingProducts) return <LoadingSpinner message="Loading products..." />;
  if (loadError) return <ErrorMessage message={loadError} />;

  return (
    <div className="page">
      <header className="page-header">
        <BackButton to="/clerk" />
        <h1>Receive Stock</h1>
        <p className="page-subtitle">
          Record products received from a supplier. Stock increases immediately.
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
            <label htmlFor="quantity">Quantity Received *</label>
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="buying_price">Buying Price (KES) *</label>
            <input
              id="buying_price"
              name="buying_price"
              type="number"
              min="0"
              step="0.01"
              value={form.buying_price}
              onChange={handleChange}
            />
            {formErrors.buying_price && (
              <span className="field-error">{formErrors.buying_price}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="selling_price">Selling Price (KES) *</label>
            <input
              id="selling_price"
              name="selling_price"
              type="number"
              min="0"
              step="0.01"
              value={form.selling_price}
              onChange={handleChange}
            />
            {formErrors.selling_price && (
              <span className="field-error">{formErrors.selling_price}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="supplier">Supplier</label>
            <input
              id="supplier"
              name="supplier"
              type="text"
              placeholder="e.g. kosh wholesalers"
              value={form.supplier}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="payment_status">Payment Status *</label>
            <select
              id="payment_status"
              name="payment_status"
              value={form.payment_status}
              onChange={handleChange}
            >
              <option value="Paid">Paid</option>
              <option value="Not Paid">Not Paid</option>
            </select>
            {formErrors.payment_status && (
              <span className="field-error">{formErrors.payment_status}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date_received">Date Received *</label>
            <input
              id="date_received"
              name="date_received"
              type="date"
              value={form.date_received}
              onChange={handleChange}
            />
            {formErrors.date_received && (
              <span className="field-error">{formErrors.date_received}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <input
              id="notes"
              name="notes"
              type="text"
              placeholder="Optional"
              value={form.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Received Stock"}
        </button>
      </form>

      {lastTransaction && (
        <WhatsAppFallback
          referenceNumber={lastTransaction.reference_number}
          product={lastTransaction.productName}
          amount={lastTransaction.total_amount}
          userName={user.name ?? user.username}
          paymentStatus="Not Paid"
          issue="Stock received but payment is still pending"
        />
      )}
    </div>
  );
}
