import { useEffect, useState } from "react";
import { getInventoryStats, getInventory } from "../services/inventoryApi";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import "../styles/dashboard.css";
import "../styles/tables.css";

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [attention, setAttention] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [statsData, inventory] = await Promise.all([
        getInventoryStats(),
        getInventory(),
      ]);
      setStats(statsData);
      // Products needing attention: low or out of stock.
      setAttention(
        inventory.filter((i) => i.stock_status !== "In Stock")
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Loading admin dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Admin Inventory Dashboard</h1>
        <p className="page-subtitle">
          Monitor stock, payments and supply requests across the shop.
        </p>
      </header>

      <div className="stat-grid">
        <StatCard label="Total Products" value={stats.total_products} />
        <StatCard label="Total Stock Units" value={stats.total_stock} />
        <StatCard
          label="Low Stock"
          value={stats.low_stock}
          variant={stats.low_stock > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Out of Stock"
          value={stats.out_of_stock}
          variant={stats.out_of_stock > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Unpaid Stock"
          value={stats.unpaid_stock}
          variant={stats.unpaid_stock > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Pending Supply Requests"
          value={stats.pending_supply_requests}
          variant={stats.pending_supply_requests > 0 ? "warning" : "default"}
        />
      </div>

      <div className="dashboard-actions">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => onNavigate("admin-received")}
        >
          View Received Stock
        </button>
        <button
          className="btn btn-outline btn-lg"
          onClick={() => onNavigate("admin-unpaid")}
        >
          Manage Payments
        </button>
        <button
          className="btn btn-outline btn-lg"
          onClick={() => onNavigate("admin-supply")}
        >
          Review Supply Requests
        </button>
      </div>

      <section className="request-list-section">
        <h2>Products Needing Attention</h2>
        {attention.length === 0 ? (
          <EmptyState
            title="All stock levels are healthy"
            message="No low-stock or out-of-stock products right now."
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Min. Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attention.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Product">{item.name}</td>
                    <td data-label="Current Stock">{item.current_stock}</td>
                    <td data-label="Min. Level">{item.minimum_stock_level}</td>
                    <td data-label="Status">
                      <StatusBadge status={item.stock_status} />
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
