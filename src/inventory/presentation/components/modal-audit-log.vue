<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  products: { type: Array, default: () => [] }
})
const emit = defineEmits(['close'])

const BASE = import.meta.env.VITE_OPTIFLOW_API_URL

const transactions = ref([])
const loading      = ref(false)
const startDate    = ref('')
const endDate      = ref('')
const productFilter = ref('all')

onMounted(async () => {
  loading.value = true
  try {
    const res  = await fetch(`${BASE}/inventoryTransactions`)
    const data = await res.json()
    transactions.value = Array.isArray(data) ? data : []
  } finally {
    loading.value = false
  }
})

function productName(id) {
  const p = props.products.find(p => p.id === id || p.product_id === id)
  return p?.name ?? `Producto #${id}`
}

// Per-product running balance calculated backwards from current stock
function withBalances(rows) {
  const productId = rows[0]?.product_id
  const product   = props.products.find(p => p.id === productId || p.product_id === productId)
  let balance     = product?.stock ?? 0

  const sorted = [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const result = sorted.map(t => {
    const balanceAfter = balance
    if (t.transaction_type === 'IN')  balance -= t.quantity
    else                              balance += t.quantity
    return { ...t, saldo: balanceAfter }
  })
  return result.reverse()
}

const filteredRows = computed(() => {
  let list = transactions.value

  if (productFilter.value !== 'all')
    list = list.filter(t => String(t.product_id) === String(productFilter.value))

  if (startDate.value)
    list = list.filter(t => t.created_at >= startDate.value)
  if (endDate.value)
    list = list.filter(t => t.created_at <= endDate.value + 'T23:59:59')

  list = [...list].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  // Group by product and compute running balances
  if (productFilter.value !== 'all') return withBalances(list)

  const byProduct = {}
  list.forEach(t => {
    ;(byProduct[t.product_id] = byProduct[t.product_id] || []).push(t)
  })
  return Object.values(byProduct).flatMap(rows => withBalances(rows))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
})

const distinctProducts = computed(() => {
  const ids = [...new Set(transactions.value.map(t => t.product_id))]
  return ids.map(id => ({ id, name: productName(id) }))
})

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : ''
}
function formatTime(iso) {
  return iso ? iso.slice(11, 16) : ''
}
function docLabel(t) {
  if (!t.reference_id) return t.reference_type || '—'
  return `${t.reference_type}-${t.reference_id}`
}
</script>

<template>
  <div class="overlay" @click="emit('close')">
    <div class="modal" @click.stop>

      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon"><i class="pi pi-book" /></div>
          <div>
            <h3 class="modal-title">Kardex de Inventario</h3>
            <p class="modal-subtitle">Registro de entradas y salidas por producto</p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')"><i class="pi pi-times" /></button>
      </div>

      <div class="filters-bar">
        <div class="filter-group">
          <i class="pi pi-box filter-icon" />
          <select v-model="productFilter" class="filter-select">
            <option value="all">Todos los productos</option>
            <option v-for="p in distinctProducts" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <i class="pi pi-calendar filter-icon" />
          <label>Desde:</label>
          <input v-model="startDate" type="date" class="date-input" />
        </div>
        <div class="filter-group">
          <label>Hasta:</label>
          <input v-model="endDate" type="date" class="date-input" />
        </div>
        <button v-if="startDate || endDate || productFilter !== 'all'" class="btn-clear"
          @click="startDate = ''; endDate = ''; productFilter = 'all'">
          Limpiar
        </button>
        <span class="results-count"><strong>{{ filteredRows.length }}</strong> movimientos</span>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="empty-state">
          <i class="pi pi-spin pi-spinner" style="font-size:1.5rem;color:#00c1b0" />
          <p style="margin-top:12px;font-family:'Montserrat',sans-serif;color:#6b7280">Cargando Kardex…</p>
        </div>

        <div v-else-if="filteredRows.length === 0" class="empty-state">
          <div class="empty-icon"><i class="pi pi-book" /></div>
          <h4 class="empty-title">Sin movimientos</h4>
          <p class="empty-desc">Aún no hay entradas o salidas registradas para este filtro.</p>
        </div>

        <div v-else class="table-wrapper">
          <div class="table-header">
            <span>Fecha</span>
            <span>Hora</span>
            <span>Documento</span>
            <span>Producto</span>
            <span class="text-center">Tipo</span>
            <span class="text-right">Entrada</span>
            <span class="text-right">Salida</span>
            <span class="text-right">Saldo</span>
          </div>

          <div v-for="row in filteredRows" :key="row.transaction_id ?? row.id" class="table-row">
            <span class="cell-muted">{{ formatDate(row.created_at) }}</span>
            <span class="cell-muted">{{ formatTime(row.created_at) }}</span>
            <span class="cell-doc">{{ docLabel(row) }}</span>
            <span class="cell-name">{{ productName(row.product_id) }}</span>
            <span class="text-center">
              <span class="badge" :class="row.transaction_type === 'IN' ? 'badge--in' : 'badge--out'">
                {{ row.transaction_type === 'IN' ? 'Entrada' : 'Salida' }}
              </span>
            </span>
            <span class="text-right cell-in">{{ row.transaction_type === 'IN' ? `+${row.quantity}` : '—' }}</span>
            <span class="text-right cell-out">{{ row.transaction_type === 'OUT' ? `-${row.quantity}` : '—' }}</span>
            <span class="text-right cell-bold">{{ row.saldo }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close" @click="emit('close')">Cerrar</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 960px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(0,193,176,0.1); color: #00c1b0; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }

.filters-bar { display: flex; align-items: center; gap: 14px; padding: 12px 24px; background: #f9fafb; border-bottom: 1px solid #f3f4f6; flex-wrap: wrap; flex-shrink: 0; }
.filter-group { display: flex; align-items: center; gap: 8px; }
.filter-icon { color: #6b7280; font-size: 0.85rem; }
.filter-group label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.filter-select { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; outline: none; background: #fff; max-width: 200px; }
.filter-select:focus { border-color: #00c1b0; }
.date-input { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; outline: none; }
.date-input:focus { border-color: #00c1b0; }
.btn-clear { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; font-weight: 600; padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #6b7280; cursor: pointer; }
.btn-clear:hover { background: #f3f4f6; }
.results-count { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; margin-left: auto; }

.modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; flex-shrink: 0; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 0; }
.empty-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(0,193,176,0.08); display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 1.6rem; margin-bottom: 16px; }
.empty-title { font-family: 'Josefin Sans', sans-serif; font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 8px; }
.empty-desc { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; text-align: center; margin: 0; max-width: 340px; }

.table-wrapper { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.table-header { display: grid; grid-template-columns: 90px 60px 130px 1fr 90px 80px 80px 80px; gap: 8px; padding: 10px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-family: 'Montserrat', sans-serif; font-size: 0.7rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }
.table-row { display: grid; grid-template-columns: 90px 60px 130px 1fr 90px 80px 80px 80px; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #f9fafb; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #374151; }
.table-row:hover { background: #f9fafb; }
.table-row:last-child { border-bottom: none; }

.cell-muted { color: #6b7280; }
.cell-doc { font-family: 'Courier New', monospace; font-size: 0.74rem; color: #6b7280; }
.cell-name { font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.badge { display: inline-flex; padding: 2px 9px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
.badge--in  { background: rgba(22,163,74,0.1);  color: #16a34a; }
.badge--out { background: rgba(220,38,38,0.1);  color: #dc2626; }

.cell-in   { font-weight: 700; color: #16a34a; }
.cell-out  { font-weight: 700; color: #dc2626; }
.cell-bold { font-weight: 700; color: #111827; }
.btn-close { padding: 9px 20px; border: none; border-radius: 8px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-close:hover { opacity: 0.9; }
</style>
