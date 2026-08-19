import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

function MerchantDashboard() {
  return (
    <DashboardLayout
      role="merchant"
      title="Merchant Dashboard"
      userName="Merchant"
    >
      <div className="welcome-section">
        <h2>Welcome back 👋</h2>
        <p>Here's an overview of your stores.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Stores"
          value="0"
          description="Stores under management"
          icon="🏪"
        />

        <StatCard
          title="Total Products"
          value="0"
          description="Products across your stores"
          icon="📦"
        />

        <StatCard
          title="Total Sales"
          value="KES 0"
          description="Current sales"
          icon="💰"
        />

        <StatCard
          title="Unpaid"
          value="KES 0"
          description="Outstanding payments"
          icon="💳"
        />
      </div>
    </DashboardLayout>
  );
}

export default MerchantDashboard;