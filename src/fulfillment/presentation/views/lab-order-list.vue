<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useFulfillmentStore } from '../../application/fulfillment.store.js'
import KanbanBoard from '../components/kanban-board.vue'
import WorkOrderDetailModal from '../components/work-order-detail-modal.vue'
import NewWorkOrderModal from '../components/new-work-order-modal.vue'

const store = useFulfillmentStore()
const toast = useToast()

const vista = ref('kanban')
const busqueda = ref('')
const filtroEstado = ref('all')
const ordenSeleccionada = ref(null)
const showNuevaOrden = ref(false)

const ESTADO_LABELS = {
  PENDING: 'Recibida', IN_PRODUCTION: 'Biselado',
  QUALITY_CONTROL: 'Control de Calidad', READY: 'Listo para Entrega', DELIVERED: 'Entregado'
}

const ORDER_FLOW = ['PENDING', 'IN_PRODUCTION', 'QUALITY_CONTROL', 'READY', 'DELIVERED']

const estadoFilterOptions = [
  { label: 'Todas las Etapas', value: 'all' },
  { label: 'Recibida',          value: 'PENDING' },
  { label: 'Biselado',          value: 'IN_PRODUCTION' },
  { label: 'Control de Calidad',value: 'QUALITY_CONTROL' },
  { label: 'Listo para Entrega',value: 'READY' },
  { label: 'Entregado',         value: 'DELIVERED' }
]

const resumen = computed(() => [
  { label: 'Recibidas',           icon: 'pi pi-clock',              color: 'yellow', status: 'PENDING' },
  { label: 'En Producción',       icon: 'pi pi-cog',                color: 'teal',   status: 'IN_PRODUCTION' },
  { label: 'Control de Calidad',  icon: 'pi pi-exclamation-circle', color: 'purple', status: 'QUALITY_CONTROL' },
  { label: 'Listas para Entrega', icon: 'pi pi-check-circle',       color: 'green',  status: 'READY' }
].map(s => ({ ...s, value: store.workOrders.filter(wo => wo.status === s.status).length })))

const filtradas = computed(() => {
  let list = store.workOrders
  const q = busqueda.value.toLowerCase()
  if (q) list = list.filter(wo =>
      String(wo.id).toLowerCase().includes(q) ||
      (wo.patientName || '').toLowerCase().includes(q) ||
      (wo.laboratorio || '').toLowerCase().includes(q)
  )
  if (filtroEstado.value !== 'all') list = list.filter(wo => wo.status === filtroEstado.value)
  return list
})

const chipColor = {
  yellow: 'chip--yellow', teal: 'chip--teal', purple: 'chip--purple', green: 'chip--green'
}

onMounted(() => {
  store.loadWorkOrders()
  store.loadLaboratories()
})

async function onStatusChanged({ wo, status }) {
  const idxActual = ORDER_FLOW.indexOf(wo.status)
  const idxNuevo = ORDER_FLOW.indexOf(status)
  const esRetroceso = idxNuevo < idxActual
  await store.updateOrderStatus(wo.id, status)
  if (esRetroceso) {
    toast.add({ severity: 'warn', summary: 'Retrabajo registrado', detail: `Orden #${wo.id} marcada como retrabajo.`, life: 2500 })
  } else {
    toast.add({ severity: 'success', summary: 'Estado actualizado', detail: `Orden #${wo.id} avanzada a ${ESTADO_LABELS[status]}.`, life: 2500 })
  }
  if (ordenSeleccionada.value?.id === wo.id) {
    ordenSeleccionada.value = { ...ordenSeleccionada.value, status }
  }
}

async function onNuevaOrden(wo) {
  await store.createWorkOrder(wo)
  showNuevaOrden.value = false
  toast.add({ severity: 'success', summary: 'Orden creada', detail: 'Nueva orden de laboratorio registrada.', life: 2500 })
}
</script>

<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Órdenes de Laboratorio</h1>
        <p class="page-subtitle">Seguimiento de Órdenes de Trabajo enviadas a laboratorios</p>
      </div>
      <div class="header-actions">
        <div class="view-toggle">
          <button class="toggle-btn" :class="{ 'toggle-btn--active': vista === 'kanban' }" @click="vista = 'kanban'">
            <i class="pi pi-th-large" /> Kanban
          </button>
          <button class="toggle-btn" :class="{ 'toggle-btn--active': vista === 'tabla' }" @click="vista = 'tabla'">
            <i class="pi pi-list" /> Tabla
          </button>
        </div>
        <button class="btn-nueva" @click="showNuevaOrden = true">
          <i class="pi pi-plus" /> Nueva Orden
        </button>
      </div>
    </div>

    <!-- Resumen -->
    <div class="summary-grid">
      <div v-for="s in resumen" :key="s.label" class="summary-card">
        <div class="summary-icon" :class="chipColor[s.color]">
          <i :class="s.icon" />
        </div>
        <div>
          <p class="summary-value">{{ s.value }}</p>
          <p class="summary-label">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrapper">
        <i class="pi pi-search search-icon" />
        <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por N° orden, paciente o laboratorio..."
            class="search-input"
        />
      </div>
      <div class="filter-wrapper">
        <select v-model="filtroEstado" class="filter-select">
          <option v-for="opt in estadoFilterOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <i class="pi pi-chevron-down filter-arrow" />
      </div>
    </div>

    <!-- Vista Kanban -->
    <KanbanBoard
        v-if="vista === 'kanban'"
        :work-orders="filtradas"
        @status-changed="onStatusChanged"
        @order-click="ordenSeleccionada = $event"
    />

    <!-- Vista Tabla -->
    <div v-else class="table-wrapper">
      <div class="table-header-row">
        <span>Orden / Paciente</span>
        <span>Estado</span>
        <span>Entrega</span>
        <span>Saldo</span>
        <span></span>
      </div>
      <div
          v-for="wo in filtradas"
          :key="wo.id"
          class="table-row"
          @click="ordenSeleccionada = wo"
      >
        <div class="row-main">
          <div class="row-dot" :class="`row-dot--${wo.prioridad || 'normal'}`" />
          <div>
            <div class="row-id-line">
              <span class="row-id">{{ wo.id }}</span>
              <span v-if="wo.retrabajo" class="tag tag--rework">RETRABAJO</span>
              <span v-if="wo.prioridad && wo.prioridad !== 'normal'" class="tag" :class="wo.prioridad === 'urgente' ? 'tag--urgent' : 'tag--high'">
                {{ wo.prioridad === 'urgente' ? 'URGENTE' : 'ALTA' }}
              </span>
            </div>
            <p class="row-patient">{{ wo.patientName || wo.paciente }}</p>
            <p class="row-lab">{{ wo.laboratorio || wo.laboratoryName }}</p>
          </div>
        </div>
        <span class="estado-badge" :class="`estado--${wo.status}`">
          {{ ESTADO_LABELS[wo.status] }}
        </span>
        <span class="row-date">{{ wo.deliveryDate || wo.fechaEsperada }}</span>
        <span :class="(wo.total - wo.adelanto) > 0 ? 'saldo--pending' : 'saldo--paid'">
          {{ (wo.total - wo.adelanto) > 0 ? `S/ ${(wo.total - wo.adelanto).toFixed(2)}` : 'Pagado' }}
        </span>
        <i class="pi pi-chevron-right row-arrow" />
      </div>
      <div v-if="filtradas.length === 0" class="table-empty">
        No se encontraron órdenes.
      </div>
      <div class="table-footer">
        <span>Mostrando {{ filtradas.length }} de {{ store.workOrders.length }} órdenes</span>
      </div>
    </div>

    <!-- Modales -->
    <WorkOrderDetailModal
        v-if="ordenSeleccionada"
        :work-order="ordenSeleccionada"
        @close="ordenSeleccionada = null"
        @status-changed="(status) => onStatusChanged({ wo: ordenSeleccionada, status })"
    />
    <NewWorkOrderModal
        v-if="showNuevaOrden"
        @save="onNuevaOrden"
        @close="showNuevaOrden = false"
    />

  </div>
</template>

<style scoped>
.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #03070a; margin: 0; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #6b7280; margin: 4px 0 0; }
.header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.view-toggle { display: flex; background: #f3f4f6; border-radius: 10px; padding: 4px; }
.toggle-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: none; background: transparent; border-radius: 7px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; }
.toggle-btn--active { background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.1); color: #111827; }

.btn-nueva { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #00c1b0; color: #fff; border: none; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.btn-nueva:hover { opacity: 0.9; }

.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.summary-card { background: #fff; border-radius: 14px; padding: 16px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px; }
.summary-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
.chip--yellow { background: #fef9c3; color: #a16207; }
.chip--teal   { background: rgba(0,193,176,0.12); color: #00c1b0; }
.chip--purple { background: #ede9fe; color: #6d28d9; }
.chip--green  { background: #dcfce7; color: #15803d; }
.summary-value { font-family: 'Josefin Sans', sans-serif; font-size: 1.4rem; font-weight: 700; color: #111827; margin: 0; }
.summary-label { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #6b7280; margin: 0; }

.toolbar { background: #fff; border-radius: 12px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); padding: 12px 16px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.search-wrapper { flex: 1; min-width: 200px; position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.85rem; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; outline: none; color: #374151; }
.search-input:focus { border-color: #00c1b0; }

.filter-wrapper { position: relative; display: flex; align-items: center; }
.filter-select { appearance: none; -webkit-appearance: none; padding: 8px 36px 8px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #374151; background: #fff; outline: none; cursor: pointer; transition: border-color 0.15s; }
.filter-select:focus { border-color: #00c1b0; }
.filter-arrow { position: absolute; right: 10px; font-size: 0.7rem; color: #9ca3af; pointer-events: none; }

.table-wrapper { background: #fff; border-radius: 14px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow: hidden; }
.table-header-row { display: grid; grid-template-columns: 1fr 150px 100px 100px 24px; gap: 16px; padding: 10px 20px; background: #f9fafb; border-bottom: 1px solid #f3f4f6; font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }
.table-row { display: grid; grid-template-columns: 1fr 150px 100px 100px 24px; gap: 16px; padding: 14px 20px; align-items: center; cursor: pointer; border-bottom: 1px solid #f9fafb; transition: background 0.1s; }
.table-row:hover { background: #f9fafb; }
.row-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
.row-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.row-dot--urgente { background: #ef4444; }
.row-dot--alta    { background: #f97316; }
.row-dot--normal  { background: #d1d5db; }
.row-id-line { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.row-id { font-family: 'Courier New', monospace; font-size: 0.84rem; font-weight: 700; color: #111827; }
.tag { font-family: 'Montserrat', sans-serif; font-size: 0.66rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; }
.tag--rework  { background: #fee2e2; color: #b91c1c; }
.tag--urgent  { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
.tag--high    { background: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }
.row-patient { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #374151; margin: 2px 0 0; }
.row-lab { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #9ca3af; margin: 0; }
.estado-badge { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-align: center; white-space: nowrap; }
.estado--PENDING         { background: #f3f4f6; color: #4b5563; }
.estado--IN_PRODUCTION   { background: rgba(0,193,176,0.12); color: #00c1b0; }
.estado--QUALITY_CONTROL { background: #ede9fe; color: #6d28d9; }
.estado--READY           { background: #dcfce7; color: #15803d; }
.estado--DELIVERED       { background: #f3f4f6; color: #9ca3af; }
.row-date { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; color: #6b7280; }
.saldo--pending { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 700; color: #ea580c; }
.saldo--paid    { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 600; color: #16a34a; }
.row-arrow { color: #d1d5db; transition: color 0.1s; }
.table-row:hover .row-arrow { color: #00c1b0; }
.table-empty { padding: 48px 20px; text-align: center; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #9ca3af; }
.table-footer { padding: 12px 20px; border-top: 1px solid #f3f4f6; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
</style>