import DashboardLayout from "../../layouts/DashboardLayout";

function Stores() {
  return (
    <DashboardLayout
      role="merchant"
      title="Stores"
      userName="Merchant"
    >
      <div className="page-header">
        <div>
          <h2>My Stores</h2>
          <p>Manage stores under your account.</p>
        </div>

        <button className="primary-button">
          + Add Store
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Store</th>
              <th>Location</th>
              <th>Admin</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>No stores</td>
              <td>—</td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Stores;