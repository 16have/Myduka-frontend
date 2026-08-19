import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";

function DashboardLayout({
  children,
  role = "clerk",
  title = "Dashboard",
  userName = "User",
}) {
  return (
    <div className="dashboard-container">
      <Sidebar role={role} />

      <main className="dashboard-main">
        <Topbar title={title} userName={userName} />

        <section className="dashboard-content">
          {children}
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;