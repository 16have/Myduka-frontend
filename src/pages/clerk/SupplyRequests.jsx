import DashboardLayout from "../../layouts/DashboardLayout";

function Spoilage() {
  return (
    <DashboardLayout
      role="clerk"
      title="Spoilage"
      userName="Store Clerk"
    >
      <div className="page-header">
        <div>
          <h2>Report Spoilage</h2>
          <p>Record products that were broken, expired or spoiled.</p>
        </div>
      </div>

      <div className="form-card">
        <h3>Report Spoiled Product</h3>

        <form>
          <div className="form-grid">
            <div className="form-group">
              <label>Product</label>
              <input
                type="text"
                placeholder="Enter product"
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
          </div>

          <div className="form-group">
            <label>Reason</label>

            <select>
              <option value="">Select reason</option>
              <option value="broken">Broken</option>
              <option value="expired">Expired</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" className="primary-button">
            Report Spoilage
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default Spoilage;