import DashboardLayout from "../../layouts/DashboardLayout";

function Clerks() {
  return (
    <DashboardLayout
      role="admin"
      title="Clerks"
      userName="Store Admin"
    >
      <div className="page-header">
        <div>
          <h2>Store Clerks</h2>
          <p>Manage clerks working in this store.</p>
        </div>

        <button className="primary-button">
          + Add Clerk
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>No clerks</td>
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

export default Clerks;