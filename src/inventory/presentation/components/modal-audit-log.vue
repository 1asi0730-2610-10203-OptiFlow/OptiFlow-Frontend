<script setup>
import { ref, computed, onMounted } from 'vue'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'
import { StockAuditLogApi } from '../../infrastructure/stock-audit-log-api.js'

const emit = defineEmits(['close'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const stockAuditLogApi = new StockAuditLogApi()

const logs          = ref([])
const loading        = ref(false)
const startDate      = ref('')
const endDate        = ref('')
const productFilter  = ref('all')

onMounted(async () => {
  loading.value = true
  try {
    const data = await stockAuditLogApi.getAuditLogs()
    logs.value = Array.isArray(data) ? data : []
  } finally {
    loading.value = false
  }
})

const filteredRows = computed(() => {
  let list = logs.value

  if (productFilter.value !== 'all')
    list = list.filter(l => String(l.productId) === String(productFilter.value))

  if (startDate.value)
    list = list.filter(l => l.date >= startDate.value)
  if (endDate.value)
    list = list.filter(l => l.date <= endDate.value)

  return [...list].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
})

const distinctProducts = computed(() => {
  const seen = new Map()
  logs.value.forEach(l => { if (!seen.has(l.productId)) seen.set(l.productId, l.productName) })
  return [...seen.entries()].map(([id, name]) => ({ id, name }))
})

function formatTime(time) {
  return time ? time.slice(0, 5) : ''
}
</script>

<template>
  <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
    <div class="modal" @click.stop>

      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon"><i class="pi pi-book" /></div>
          <div>
            <h3 class="modal-title">Kardex de Inventario</h3>
            <p class="modal-subtitle">Registro de entradas y salidas por producto</p>
          </div>
        </div>
        <button class="close-btn" @click="requestClose"><i class="pi pi-times" /></button>
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
          <input v-model="startDate" type="date" class="date-input" :max="endDate || undefined" />
        </div>
        <div class="filter-group">
          <label>Hasta:</label>
          <input v-model="endDate" type="date" class="date-input" :min="startDate || undefined" />
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
            <span>Operación</span>
            <span>Producto</span>
            <span>Autor</span>
            <span class="text-center">Tipo</span>
            <span class="text-right">Entrada</span>
            <span class="text-right">Salida</span>
            <span class="text-right">Saldo</span>
          </div>

          <div v-for="row in filteredRows" :key="row.id" class="table-row">
            <span class="cell-muted">{{ row.date }}</span>
            <span class="cell-muted">{{ formatTime(row.time) }}</span>
            <span class="cell-doc">{{ row.operation }}</span>
            <span class="cell-name">{{ row.productName }}</span>
            <span class="cell-muted">{{ row.author }}</span>
            <span class="text-center">
              <span class="badge" :class="row.quantity >= 0 ? 'badge--in' : 'badge--out'">
                {{ row.quantity >= 0 ? 'Entrada' : 'Salida' }}
              </span>
            </span>
            <span class="text-right cell-in">{{ row.quantity > 0 ? `+${row.quantity}` : '—' }}</span>
            <span class="text-right cell-out">{{ row.quantity < 0 ? row.quantity : '—' }}</span>
            <span class="text-right cell-bold">{{ row.newStock }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close" @click="requestClose">Cerrar</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 1080px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
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
.table-header { display: grid; grid-template-columns: 90px 60px 120px 1fr 100px 80px 70px 70px 70px; gap: 8px; padding: 10px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-family: 'Montserrat', sans-serif; font-size: 0.7rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }
.table-row { display: grid; grid-template-columns: 90px 60px 120px 1fr 100px 80px 70px 70px 70px; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #f9fafb; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #374151; }
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
