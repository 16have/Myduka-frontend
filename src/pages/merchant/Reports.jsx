import DashboardLayout from "../../layouts/DashboardLayout";

function Admins() {
  return (
    <DashboardLayout
      role="merchant"
      title="Store Admins"
      userName="Merchant"
    >
      <div className="page-header">
        <div>
          <h2>Store Admins</h2>
          <p>Manage administrators for your stores.</p>
        </div>

        <button className="primary-button">
          + Add Admin
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Store</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>No admins</td>
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

export default Admins;