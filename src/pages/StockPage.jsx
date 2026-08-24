import { useEffect, useMemo, useState } from "react";
import { getInventory } from "../services/inventoryApi";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import BackButton from "../components/BackButton";
import "../styles/tables.css";
import "../styles/inventory.css";

export default function StockPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getInventory());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function run() {
      load();
    }
    run();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.stock_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  if (loading) return <LoadingSpinner message="Loading stock..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="page">
      <header className="page-header">
        <BackButton to="/clerk" />
        <h1>Current Stock</h1>
        <p className="page-subtitle">
          Live stock levels for every product, straight from the database.
        </p>
      </header>

      <div className="table-toolbar">
        <input
          className="table-search"
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="table-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          message="Try a different search or filter, or receive new stock."
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Buying Price</th>
                <th>Selling Price</th>
                <th>Min. Level</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td data-label="Product">{item.name}</td>
                  <td data-label="Current Stock">{item.current_stock}</td>
                  <td data-label="Buying Price">
                    KES {Number(item.buying_price).toLocaleString()}
                  </td>
                  <td data-label="Selling Price">
                    KES {Number(item.selling_price).toLocaleString()}
                  </td>
                  <td data-label="Min. Level">{item.minimum_stock_level}</td>
                  <td data-label="Status">
                    <StatusBadge status={item.stock_status} />
                  </td>
                  <td data-label="Last Updated">
                    {new Date(item.updated_at).toLocaleString()}
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
