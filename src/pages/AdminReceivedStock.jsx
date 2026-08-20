import { useEffect, useMemo, useState } from "react";
import { getReceivedStock } from "../services/inventoryApi";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import BackButton from "../components/BackButton";
import "../styles/tables.css";

export default function AdminReceivedStock() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRows(await getReceivedStock());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.product_name.toLowerCase().includes(search.toLowerCase()) ||
          (r.clerk_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (r.supplier || "").toLowerCase().includes(search.toLowerCase())
      ),
    [rows, search]
  );

  if (loading) return <LoadingSpinner message="Loading received stock..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="page">
      <header className="page-header">
        <BackButton to="/admin" />
        <h1>Received Stock</h1>
        <p className="page-subtitle">
          Every stock delivery recorded by clerks, with prices and payment
          status.
        </p>
      </header>

      <div className="table-toolbar">
        <input
          className="table-search"
          type="search"
          placeholder="Search product, clerk or supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No received stock found"
          message="Stock recorded by clerks will appear here."
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Buying Price</th>
                <th>Selling Price</th>
                <th>Supplier</th>
                <th>Payment</th>
                <th>Recorded By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td data-label="Reference">{r.reference_number}</td>
                  <td data-label="Product">{r.product_name}</td>
                  <td data-label="Qty">{r.quantity}</td>
                  <td data-label="Buying Price">
                    KES {Number(r.buying_price).toLocaleString()}
                  </td>
                  <td data-label="Selling Price">
                    KES {Number(r.selling_price).toLocaleString()}
                  </td>
                  <td data-label="Supplier">{r.supplier || "—"}</td>
                  <td data-label="Payment">
                    <StatusBadge status={r.payment_status} />
                  </td>
                  <td data-label="Recorded By">{r.clerk_name}</td>
                  <td data-label="Date">
                    {new Date(r.created_at).toLocaleString()}
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
