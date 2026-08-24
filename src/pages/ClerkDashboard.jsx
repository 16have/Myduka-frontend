import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getInventoryStats } from "../services/inventoryApi";
import { useAuth } from "@/lib/auth";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import BackButton from "../components/BackButton";
import "../styles/dashboard.css";

export default function ClerkDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventoryStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function run() {
      loadStats();
    }
    run();
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <BackButton to="/login" />
        <h1>Inventory Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, <strong>{user?.name}</strong>. Here is the stock
          overview.
        </p>
      </header>

      {loading && <LoadingSpinner message="Loading dashboard..." />}
      {error && <ErrorMessage message={error} onRetry={loadStats} />}

      {stats && !loading && (
        <>
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
              onClick={() => navigate("/clerk/receive-stock")}
            >
              Receive Stock
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate("/clerk/spoilage")}
            >
              Record Spoilage
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate("/clerk/supply-requests")}
            >
              Request Supply
            </button>
          </div>
        </>
      )}
    </div>
  );
}
