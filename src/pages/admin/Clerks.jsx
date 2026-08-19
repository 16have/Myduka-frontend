import DashboardLayout from "../../layouts/DashboardLayout";

function Payments() {
  return (
    <DashboardLayout
      role="admin"
      title="Payments"
      userName="Store Admin"
    >
      <div className="page-header">
        <div>
          <h2>Payments</h2>
          <p>Track paid and unpaid products.</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Supplier</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>No payments</td>
              <td>—</td>
              <td>KES 0</td>
              <td>Unpaid</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Payments;