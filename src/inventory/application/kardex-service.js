import { eventBus } from '../../shared/infrastructure/event-bus.js'
import { InventoryEvents } from '../domain/events/inventory-events.js'

const BASE = import.meta.env.VITE_OPTIFLOW_API_URL

let initialized = false

async function postTransaction({ product_id, transaction_type, quantity, reference_type, reference_id }) {
  try {
    await fetch(`${BASE}/inventoryTransactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id,
        transaction_type,
        quantity,
        reference_type,
        reference_id: reference_id ?? null,
        created_at: new Date().toISOString()
      })
    })
  } catch (e) {
    console.error('[Kardex] Failed to record transaction:', e)
  }
}

export function initKardexListener() {
  if (initialized) return
  initialized = true

  // Every restock → ENTRADA in the Kardex
  eventBus.on(InventoryEvents.STOCK_RESTOCKED, ({ product, qty, operation }) => {
    postTransaction({
      product_id:       product.id,
      transaction_type: 'IN',
      quantity:         qty,
      reference_type:   operation || 'RESTOCK',
      reference_id:     null
    })
  })

  // When a future sales module emits SALE_COMPLETED, record the SALIDA automatically.
  // No changes needed here — just uncomment and connect:
  // eventBus.on('sales:sale:completed', ({ items }) => {
  //   items.forEach(item => postTransaction({
  //     product_id: item.productId, transaction_type: 'OUT',
  //     quantity: item.quantity, reference_type: 'SALE', reference_id: item.saleId
  //   }))
  // })
}
