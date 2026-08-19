import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

function ClerkDashboard() {
  return (
    <DashboardLayout
      role="clerk"
      title="Clerk Dashboard"
      userName="Store Clerk"
    >
      <div className="welcome-section">
        <h2>Welcome back 👋</h2>
        <p>Here's what's happening in your store today.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Current Stock"
          value="0"
          description="Products currently in stock"
          icon="📦"
        />

        <StatCard
          title="Received Today"
          value="0"
          description="Products received today"
          icon="🚚"
        />

        <StatCard
          title="Supply Requests"
          value="0"
          description="Pending requests"
          icon="📝"
        />

        <StatCard
          title="Spoiled Products"
          value="0"
          description="Products reported spoiled"
          icon="⚠️"
        />
      </div>
    </DashboardLayout>
  );
}

export default ClerkDashboard;