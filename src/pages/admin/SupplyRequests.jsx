import DashboardLayout from "../../layouts/DashboardLayout";

function Products() {
  return (
    <DashboardLayout
      role="admin"
      title="Products"
      userName="Store Admin"
    >
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Manage products available in your store.</p>
        </div>

        <button className="primary-button">
          + Add Product
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Selling Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>No products available</td>
              <td>0</td>
              <td>KES 0</td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Products;