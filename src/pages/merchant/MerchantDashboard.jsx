import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/lib/auth'
import { getInventory, getInventoryStats, getReceivedStock, getUnpaidPayments } from '@/services/inventoryApi'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import StatusBadge from '@/components/StatusBadge'
import '@/styles/merchant.css'

export default function MerchantDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function load() {
    setError(null)
    try {
      const [stats, inventory, received, unpaid] = await Promise.all([
        getInventoryStats(), getInventory(), getReceivedStock(), getUnpaidPayments(),
      ])
      setData({ stats, inventory, received, unpaid })
    } catch (err) { setError(err.message) }
  }

  useEffect(() => { load() }, [])

  if (error) return <ErrorMessage message={error} onRetry={load} />
  if (!data) return <LoadingSpinner message="Loading portfolio overview..." />

  const { stats, inventory, received, unpaid } = data
  const inventoryValue = inventory.reduce((sum, item) => sum + (item.current_stock ?? 0) * parseFloat(item.buying_price ?? 0), 0)
  const retailValue = inventory.reduce((sum, item) => sum + (item.current_stock ?? 0) * parseFloat(item.selling_price ?? 0), 0)
  const projectedMargin = retailValue - inventoryValue
  const paidBatches = received.length - unpaid.length
  const weeklyBars = [45, 62, 52, 70, 58, 82, 74]

  return (
    <div className="merchant-page">
      <header className="merchant-hero">
        <div>
          <span className="merchant-eyebrow">Merchant command center</span>
          <h1>See the whole business, {user?.username ?? user?.name}.</h1>
          <p>Compare store performance, protect your margin, and stay ahead of procurement.</p>
        </div>
        <div className="merchant-hero-actions">
          <span className="merchant-demo"><span /> Mock portfolio data</span>
          <label htmlFor="store-select">Viewing</label>
          <select id="store-select" defaultValue="all">
            <option value="all">All stores · 1 location</option>
            <option value="central">Central Market Store</option>
          </select>
        </div>
      </header>

      <section className="merchant-kpis">
        <article><strong>1</strong><span>Stores reporting</span><small>Central Market Store</small></article>
        <article><strong>{stats.total_stock}</strong><span>Units in network</span><small>{stats.total_products} products tracked</small></article>
        <article><strong>KSh {projectedMargin.toLocaleString()}</strong><span>Projected stock margin</span><small>Based on current selling prices</small></article>
        <article><strong>{stats.low_stock + stats.out_of_stock}</strong><span>Stock alerts</span><small>{stats.pending_supply_requests} replenishment requests</small></article>
      </section>

      <div className="merchant-grid merchant-grid-top">
        <section className="merchant-panel merchant-chart-panel">
          <div className="merchant-panel-heading"><div><span>Performance snapshot</span><h2>Weekly store activity</h2></div><button title="Refresh portfolio" onClick={load}>Refresh</button></div>
          <div className="merchant-chart-value"><strong>KSh 18,420</strong><span>16.4% increase vs last week</span></div>
          <div className="merchant-bars" aria-label="Illustrative weekly store activity chart">
            {weeklyBars.map((height, index) => <div className="merchant-bar-column" key={index}><div className="merchant-bar" style={{ height: `${height}%` }} /><small>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</small></div>)}
          </div>
          <p className="merchant-note">Illustrative mock trend. Store-level sales will be connected to the backend later.</p>
        </section>

        <section className="merchant-panel merchant-payment-panel">
          <div className="merchant-panel-heading"><div><span>Procurement control</span><h2>Payment status</h2></div></div>
          <div className="merchant-payment-total">KSh {received.reduce((sum, item) => sum + parseFloat(item.total_cost ?? item.total_amount ?? 0), 0).toLocaleString()}<small> total received value</small></div>
          <div className="merchant-payment-track"><span style={{ width: `${received.length ? (paidBatches / received.length) * 100 : 0}%` }} /></div>
          <div className="merchant-payment-lines"><div><span><i className="paid-dot" /> Paid batches</span><strong>{paidBatches}</strong></div><div><span><i className="due-dot" /> Awaiting payment</span><strong>{unpaid.length}</strong></div></div>
          <button className="merchant-link" onClick={() => navigate('/admin/unpaid')}>Open payment register</button>
        </section>
      </div>

      <section className="merchant-panel merchant-products-panel">
        <div className="merchant-panel-heading"><div><span>Store and product performance</span><h2>Margin by product</h2></div><span className="merchant-table-note">Current stock value · KSh</span></div>
        <div className="merchant-table-wrap"><table className="merchant-table"><thead><tr><th>Product</th><th>Store</th><th>Units</th><th>Buy value</th><th>Retail value</th><th>Margin</th><th>Status</th></tr></thead><tbody>{inventory.map(item => { const units = item.current_stock ?? 0; const buy = parseFloat(item.buying_price ?? 0); const sell = parseFloat(item.selling_price ?? 0); const margin = (sell - buy) * units; return <tr key={item.id}><td><strong>{item.name}</strong><small>{item.category}</small></td><td>Central Market</td><td>{units}</td><td>KSh {(units * buy).toLocaleString()}</td><td>KSh {(units * sell).toLocaleString()}</td><td className="margin-value">KSh {margin.toLocaleString()}</td><td><StatusBadge status={item.stock_status} /></td></tr> })}</tbody></table></div>
      </section>
    </div>
  )
}