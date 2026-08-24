import { describe, expect, it, vi } from 'vitest'

// demoData holds its state in module-level arrays, not localStorage, so each
// test gets a fresh copy of the module to avoid state leaking between tests.
async function freshDemoApi() {
  vi.resetModules()
  const { demoApi } = await import('./demoData')
  return demoApi
}

describe('demoApi.getInventory', () => {
  it('derives stock_status from current_stock vs minimum_stock_level', async () => {
    const demoApi = await freshDemoApi()
    const inventory = await demoApi.getInventory()

    const byName = Object.fromEntries(inventory.map((p) => [p.name, p.stock_status]))
    expect(byName['Maize Flour 2kg']).toBe('In Stock')
    expect(byName['Sugar 1kg']).toBe('Low Stock')
    expect(byName['Cooking Oil 1L']).toBe('Out of Stock')
  })
})

describe('demoApi.receiveStock', () => {
  it('increases current_stock and records a transaction', async () => {
    const demoApi = await freshDemoApi()

    const before = await demoApi.getInventoryItem(1)
    const txn = await demoApi.receiveStock(
      { product_id: 1, quantity: 10, buying_price: 145, selling_price: 185, supplier: 'Test Supplier', payment_status: 'Not Paid' },
      2,
    )

    expect(txn.new_stock_level).toBe(before.current_stock + 10)
    expect(txn.total_amount).toBe(10 * 145)

    const after = await demoApi.getInventoryItem(1)
    expect(after.current_stock).toBe(before.current_stock + 10)
    expect(after.buying_price).toBe(145)
  })

  it('does not collide with seeded transaction reference numbers', async () => {
    const demoApi = await freshDemoApi()
    const existing = await demoApi.getReceivedStock()
    const existingRefs = new Set(existing.map((t) => t.reference_number))

    const txn = await demoApi.receiveStock(
      { product_id: 1, quantity: 1, buying_price: 140, selling_price: 180, supplier: 's', payment_status: 'Paid' },
      2,
    )

    expect(existingRefs.has(txn.reference_number)).toBe(false)
  })
})

describe('demoApi.recordSpoilage', () => {
  it('decreases current_stock by the spoiled quantity', async () => {
    const demoApi = await freshDemoApi()
    const before = await demoApi.getInventoryItem(1)

    const result = await demoApi.recordSpoilage({ product_id: 1, quantity: 5, reason: 'Damaged' }, 2)

    expect(result.new_stock_level).toBe(before.current_stock - 5)
  })

  it('rejects spoilage quantities greater than the available stock', async () => {
    const demoApi = await freshDemoApi()
    const before = await demoApi.getInventoryItem(2) // Sugar 1kg, current_stock 8

    await expect(
      demoApi.recordSpoilage({ product_id: 2, quantity: before.current_stock + 1, reason: 'Too much' }, 2),
    ).rejects.toThrow('Spoilage quantity exceeds available stock.')
  })
})

describe('demoApi.createSupplyRequest / updateSupplyRequest', () => {
  it('assigns a new request an id that does not collide with seeded requests', async () => {
    const demoApi = await freshDemoApi()
    const existing = await demoApi.getSupplyRequests()
    const existingIds = new Set(existing.map((r) => r.id))

    const created = await demoApi.createSupplyRequest({ product_id: 1, quantity: 20, reason: 'Restock' }, 2)

    expect(existingIds.has(created.id)).toBe(false)
    expect(created.status).toBe('Pending')
  })

  it('updates an existing request without touching unrelated requests', async () => {
    const demoApi = await freshDemoApi()
    const before = await demoApi.getSupplyRequests()
    const target = before.find((r) => r.status === 'Pending')
    const other = before.find((r) => r.id !== target.id)

    const updated = await demoApi.updateSupplyRequest(target.id, { status: 'Approved', admin_response: 'Go ahead' })

    expect(updated.status).toBe('Approved')
    expect(updated.admin_response).toBe('Go ahead')

    const after = await demoApi.getSupplyRequests()
    const untouched = after.find((r) => r.id === other.id)
    expect(untouched).toEqual(other)
  })
})

describe('demoApi payments', () => {
  it('lists only unpaid transactions', async () => {
    const demoApi = await freshDemoApi()
    const unpaid = await demoApi.getUnpaidPayments()

    expect(unpaid.length).toBeGreaterThan(0)
    expect(unpaid.every((t) => t.payment_status === 'Not Paid')).toBe(true)
  })

  it('moves a transaction out of the unpaid list once marked Paid', async () => {
    const demoApi = await freshDemoApi()
    const [firstUnpaid] = await demoApi.getUnpaidPayments()

    await demoApi.updatePaymentStatus(firstUnpaid.id, 'Paid')

    const stillUnpaid = await demoApi.getUnpaidPayments()
    expect(stillUnpaid.some((t) => t.id === firstUnpaid.id)).toBe(false)
  })
})
