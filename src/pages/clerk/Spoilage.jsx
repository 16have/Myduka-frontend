import DashboardLayout from "../../layouts/DashboardLayout";

function ReceivedStock() {
  return (
    <DashboardLayout
      role="clerk"
      title="Received Stock"
      userName="Store Clerk"
    >
      <div className="page-header">
        <div>
          <h2>Received Stock</h2>
          <p>Record products received at the store.</p>
        </div>
      </div>

      <div className="form-card">
        <h3>Record Received Product</h3>

        <form>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                placeholder="Enter quantity"
              />
            </div>

            <div className="form-group">
              <label>Buying Price</label>
              <input
                type="number"
                min="0"
                placeholder="KES"
              />
            </div>

            <div className="form-group">
              <label>Selling Price</label>
              <input
                type="number"
                min="0"
                placeholder="KES"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Status</label>

            <select>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <button type="submit" className="primary-button">
            Record Product
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default ReceivedStock;