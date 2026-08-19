import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

function AdminDashboard() {
  return (
    <DashboardLayout
      role="admin"
      title="Store Admin Dashboard"
      userName="Store Admin"
    >
      <div className="welcome-section">
        <h2>Welcome back 👋</h2>
        <p>Here's an overview of your store.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value="0"
          description="Products in inventory"
          icon="📦"
        />

        <StatCard
          title="Pending Requests"
          value="0"
          description="Supply requests awaiting action"
          icon="📝"
        />

        <StatCard
          title="Unpaid Products"
          value="0"
          description="Payments awaiting confirmation"
          icon="💳"
        />

        <StatCard
          title="Clerks"
          value="0"
          description="Active store clerks"
          icon="👥"
        />
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;