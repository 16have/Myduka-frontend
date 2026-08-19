import DashboardLayout from "../../layouts/DashboardLayout";

function Inventory() {
  return (
    <DashboardLayout
      role="clerk"
      title="Inventory"
      userName="Store Clerk"
    >
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          <p>View the current products and stock levels.</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Buying Price</th>
              <th>Selling Price</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>No products yet</td>
              <td>0</td>
              <td>KES 0</td>
              <td>KES 0</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Inventory;