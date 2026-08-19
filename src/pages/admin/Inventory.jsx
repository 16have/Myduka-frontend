import DashboardLayout from "../../layouts/DashboardLayout";

function Inventory() {
  return (
    <DashboardLayout
      role="admin"
      title="Inventory"
      userName="Store Admin"
    >
      <div className="page-header">
        <div>
          <h2>Store Inventory</h2>
          <p>Monitor products and stock levels.</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Buying Price</th>
              <th>Selling Price</th>
              <th>Payment</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>No inventory data</td>
              <td>0</td>
              <td>KES 0</td>
              <td>KES 0</td>
              <td>Unpaid</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Inventory;