import DashboardLayout from "../../layouts/DashboardLayout";

function SupplyRequests() {
  return (
    <DashboardLayout
      role="admin"
      title="Supply Requests"
      userName="Store Admin"
    >
      <div className="page-header">
        <div>
          <h2>Supply Requests</h2>
          <p>Review requests submitted by store clerks.</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Clerk</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>No requests</td>
              <td>—</td>
              <td>—</td>
              <td>—</td>
              <td>Pending</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default SupplyRequests;