import { eventBus } from '../../shared/infrastructure/event-bus.js'
import { InventoryEvents } from '../domain/events/inventory-events.js'

const BASE = import.meta.env.VITE_OPTIFLOW_API_URL

let initialized = false

async function postTransaction({ product_id, transaction_type, quantity, reference_type, reference_id }) {
  const body = {
    id: Date.now(),
    product_id,
    transaction_type,
    quantity,
    reference_type,
    reference_id: reference_id ?? null,
    created_at: new Date().toISOString()
  }
  try {
    const res = await fetch(`${BASE}/inventoryTransactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`[Kardex] POST failed (${res.status}):`, text)
    }
  } catch (e) {
    console.error('[Kardex] Network error — is the json-server running on port 3000?', e.message)
  }
}

export function initKardexListener() {
  if (initialized) return
  initialized = true

  // New product with initial stock → opening ENTRADA
  eventBus.on(InventoryEvents.PRODUCT_CREATED, ({ product }) => {
    if (product.stock > 0) {
      postTransaction({
        product_id:       product.id,
        transaction_type: 'IN',
        quantity:         product.stock,
        reference_type:   'INITIAL_STOCK',
        reference_id:     null
      })
    }
  })

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
