import DashboardLayout from "../../layouts/DashboardLayout";

function Products() {
  return (
    <DashboardLayout
      role="merchant"
      title="Products"
      userName="Merchant"
    >
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>View product performance across your stores.</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Store</th>
              <th>Stock</th>
              <th>Performance</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>No products</td>
              <td>—</td>
              <td>0</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Products;