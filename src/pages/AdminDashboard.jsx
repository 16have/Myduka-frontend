import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/auth";
import { getInventoryStats, getInventory } from "../services/inventoryApi";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import "../styles/dashboard.css";
import "../styles/tables.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      setAttention(
        inventory.filter((i) => i.stock_status !== "in_stock")
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

  const healthyProducts = stats.total_products - stats.low_stock - stats.out_of_stock;
  const stockCoverage = stats.total_products ? Math.round((healthyProducts / stats.total_products) * 100) : 0;
  const weeklyBars = [42, 58, 48, 72, 64, 86, 78];

  return (
    <div className="page admin-dashboard">
      <header className="dashboard-hero">
        <div>
          <span className="eyebrow">Store operations / Overview</span>
          <h1>Hello, {user?.username ?? user?.name ?? 'there'}.</h1>
          <p className="page-subtitle">Here is the pulse of your shop, all in one place.</p>
        </div>
        <div className="hero-meta">
          <span className="demo-pill"><span /> Demo workspace</span>
          <span className="hero-date">Friday, 21 August 2026</span>
        </div>
      </header>

      <div className="stat-grid dashboard-stats">
        <StatCard label="Products tracked" value={stats.total_products} />
        <StatCard label="Units in stock" value={stats.total_stock} variant="blue" />
        <StatCard label="Needs attention" value={stats.low_stock + stats.out_of_stock} variant="warning" />
        <StatCard label="Pending requests" value={stats.pending_supply_requests} variant="danger" />
      </div>

      <div className="dashboard-columns">
        <section className="report-panel stock-report">
          <div className="panel-heading">
            <div><span className="panel-kicker">Inventory flow</span><h2>Stock movement</h2></div>
            <button className="icon-button" title="Refresh dashboard" onClick={load}>Refresh</button>
          </div>
          <div className="chart-summary"><strong>{stats.total_stock}</strong><span>units currently on hand</span><b>12.8% increase</b></div>
          <div className="bar-chart" aria-label="Illustrative weekly stock movement chart">
            {weeklyBars.map((height, index) => <div className="bar-column" key={index}><div className="bar" style={{ height: `${height}%` }} /><span>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span></div>)}
          </div>
          <span className="chart-note">Illustrative demo trend. Live reports will connect to the Flask API.</span>
        </section>

        <section className="report-panel payment-report">
          <div className="panel-heading"><div><span className="panel-kicker">Procurement</span><h2>Payment exposure</h2></div></div>
          <div className="payment-number">{stats.unpaid_stock}<small> unpaid batches</small></div>
          <div className="progress-track"><span style={{ width: `${stats.unpaid_stock ? 62 : 100}%` }} /></div>
          <div className="payment-legend"><span><i className="dot dot-paid" /> Paid & reconciled</span><strong>{stats.total_products - stats.unpaid_stock}</strong><span><i className="dot dot-due" /> Due for review</span><strong>{stats.unpaid_stock}</strong></div>
          <button className="text-action" onClick={() => navigate("/admin/unpaid")}>Review unpaid stock</button>
        </section>
      </div>

      <div className="dashboard-columns lower-panels">
        <section className="report-panel attention-panel">
          <div className="panel-heading"><div><span className="panel-kicker">Inventory health</span><h2>Products needing attention</h2></div><span className="health-score">{stockCoverage}% healthy</span></div>
        {attention.length === 0 ? (
          <EmptyState
            title="All stock levels are healthy"
            message="No low-stock or out-of-stock products right now."
          />
        ) : (
          <div className="table-wrapper compact-table">
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
        <section className="report-panel quick-actions">
          <div className="panel-heading"><div><span className="panel-kicker">Next steps</span><h2>Keep the shop moving</h2></div></div>
          <button onClick={() => navigate("/admin/received")}><span><strong>View received stock</strong><small>Audit the latest deliveries</small></span></button>
          <button onClick={() => navigate("/admin/supply")}><span><strong>Review supply requests</strong><small>{stats.pending_supply_requests} requests waiting</small></span></button>
        </section>
      </div>
    </div>
  );
}
