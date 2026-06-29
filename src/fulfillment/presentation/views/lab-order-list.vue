<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import ContextMenu from 'primevue/contextmenu'
import { useFulfillmentStore } from '../../application/fulfillment.store.js'
import { useClinicalStore } from '../../../clinical/application/clinical.store.js'
import { useSalesStore } from '../../../sales/application/sales.store.js'
import { eventBus } from '../../../shared/infrastructure/event-bus.js'
import KanbanBoard from '../components/kanban-board.vue'
import WorkOrderDetailModal from '../components/work-order-detail-modal.vue'
import NewWorkOrderModal from '../components/new-work-order-modal.vue'
import QualityAssuranceModal from '../components/quality-assurance-modal.vue'
import RegisterLaboratoryModal from '../components/register-laboratory-modal.vue'

const { t } = useI18n()
const store = useFulfillmentStore()
const clinicalStore = useClinicalStore()
const salesStore = useSalesStore()
const toast = useToast()

const currentView = ref('kanban')
const searchQuery = ref('')
const statusFilter = ref('all')
const selectedOrder = ref(null)
const showNewOrderModal = ref(false)
const showRegisterLabModal = ref(false)
const showQaModal = ref(false)
const qaTargetOrder = ref(null)

const ORDER_FLOW = ['PENDING', 'IN_PRODUCTION', 'QUALITY_CONTROL', 'READY', 'DELIVERED']

const statusFilterOptions = computed(() => [
  { label: t('labOrders.allStages'), value: 'all' },
  { label: t('labOrders.status.PENDING'),         value: 'PENDING' },
  { label: t('labOrders.status.IN_PRODUCTION'),   value: 'IN_PRODUCTION' },
  { label: t('labOrders.status.QUALITY_CONTROL'), value: 'QUALITY_CONTROL' },
  { label: t('labOrders.status.READY'),           value: 'READY' },
  { label: t('labOrders.status.DELIVERED'),       value: 'DELIVERED' }
])

const summary = computed(() => [
  { labelKey: 'labOrders.summary.received',        icon: 'pi pi-clock',              color: 'yellow', status: 'PENDING' },
  { labelKey: 'labOrders.summary.inProduction',    icon: 'pi pi-cog',                color: 'teal',   status: 'IN_PRODUCTION' },
  { labelKey: 'labOrders.summary.qualityControl',  icon: 'pi pi-exclamation-circle', color: 'purple', status: 'QUALITY_CONTROL' },
  { labelKey: 'labOrders.summary.readyForDelivery',icon: 'pi pi-check-circle',       color: 'green',  status: 'READY' }
].map(item => ({
  ...item,
  value: store.workOrders.filter(workOrder => workOrder.status === item.status).length
})))

const filteredOrders = computed(() => {
  let list = store.workOrders
  const query = searchQuery.value.toLowerCase()
  if (query) list = list.filter(workOrder =>
      String(workOrder.id).toLowerCase().includes(query) ||
      (workOrder.patientName || '').toLowerCase().includes(query) ||
      (workOrder.laboratoryName || '').toLowerCase().includes(query)
  )
  if (statusFilter.value !== 'all') list = list.filter(workOrder => workOrder.status === statusFilter.value)
  return list
})

const chipColor = {
  yellow: 'chip--yellow', teal: 'chip--teal', purple: 'chip--purple', green: 'chip--green'
}

let unsubNewLabOrder
onMounted(() => {
  store.loadWorkOrders()
  store.loadLaboratories()
  clinicalStore.loadPatients()
  clinicalStore.loadClinicalRecords()
  clinicalStore.loadPrescriptions()
  salesStore.fetchSales()
  unsubNewLabOrder = eventBus.on('ui:open:new-lab-order', () => { showNewOrderModal.value = true })
})
onUnmounted(() => { unsubNewLabOrder?.() })

async function onStatusChanged({ workOrder, status }) {
  // Regla de negocio: QC → READY requiere pasar el formulario de QA
  if (workOrder.status === 'QUALITY_CONTROL' && status === 'READY') {
    qaTargetOrder.value = workOrder
    showQaModal.value = true
    return
  }

  const currentIndex = ORDER_FLOW.indexOf(workOrder.status)
  const newIndex = ORDER_FLOW.indexOf(status)
  const isRework = newIndex < currentIndex
  await store.updateOrderStatus(workOrder.id, status)
  if (isRework) {
    toast.add({
      severity: 'warn',
      summary: t('labOrders.toast.reworkRegistered'),
      detail: `${t('common.order')} #${workOrder.id} ${t('labOrders.toast.reworkDetail')}`,
      life: 2500
    })
  } else {
    toast.add({
      severity: 'success',
      summary: t('labOrders.toast.statusUpdated'),
      detail: `${t('common.order')} #${workOrder.id} → ${t(`labOrders.status.${status}`)}`,
      life: 2500
    })
  }
  if (selectedOrder.value?.id === workOrder.id) {
    selectedOrder.value = { ...selectedOrder.value, status }
  }
}

async function onQaApproved() {
  const workOrder = qaTargetOrder.value
  showQaModal.value = false
  qaTargetOrder.value = null
  await store.updateOrderStatus(workOrder.id, 'READY')
  toast.add({
    severity: 'success',
    summary: t('labOrders.toast.qaApproved'),
    detail: `${t('common.order')} #${workOrder.id} → ${t('labOrders.status.READY')}`,
    life: 2500
  })
  if (selectedOrder.value?.id === workOrder.id) {
    selectedOrder.value = { ...selectedOrder.value, status: 'READY' }
  }
}

async function onQaRejected() {
  const workOrder = qaTargetOrder.value
  showQaModal.value = false
  qaTargetOrder.value = null
  await store.updateOrderStatus(workOrder.id, 'IN_PRODUCTION')
  toast.add({
    severity: 'warn',
    summary: t('labOrders.toast.qaRejected'),
    detail: `${t('common.order')} #${workOrder.id} ${t('labOrders.toast.reworkDetail')}`,
    life: 2500
  })
  if (selectedOrder.value?.id === workOrder.id) {
    selectedOrder.value = { ...selectedOrder.value, status: 'IN_PRODUCTION' }
  }
}

async function onNewOrder(workOrder) {
  await store.createWorkOrder(workOrder)
  showNewOrderModal.value = false
  toast.add({
    severity: 'success',
    summary: t('labOrders.toast.orderCreated'),
    detail: t('labOrders.toast.orderCreatedDetail'),
    life: 2500
  })
}

async function onNewLaboratory(laboratory) {
  await store.createLaboratory(laboratory)
  toast.add({
    severity: 'success',
    summary: t('labOrders.toast.labRegistered'),
    detail: `${laboratory.name} ${t('labOrders.toast.labRegisteredDetail')}`,
    life: 2500
  })
}

// Right-click context menu (table view only)
const contextMenuRef = ref(null)
const contextOrder = ref(null)

const contextMenuItems = computed(() => {
  const order = contextOrder.value
  if (!order) return []
  const currentIdx = ORDER_FLOW.indexOf(order.status)
  const nextSt = currentIdx >= 0 && currentIdx < ORDER_FLOW.length - 1 ? ORDER_FLOW[currentIdx + 1] : null
  const items = [
    {
      label: t('labOrders.contextMenu.viewDetails'),
      icon: 'pi pi-eye',
      command: () => { selectedOrder.value = order }
    }
  ]
  if (nextSt) {
    items.push({
      label: `${t('labOrders.contextMenu.advanceStatus')}: ${t(`labOrders.status.${nextSt}`)}`,
      icon: 'pi pi-arrow-right',
      command: () => { onStatusChanged({ workOrder: order, status: nextSt }) }
    })
  }
  items.push({ separator: true })
  items.push({
    label: t('labOrders.contextMenu.copyOrderId'),
    icon: 'pi pi-copy',
    command: () => { navigator.clipboard.writeText(String(order.id)) }
  })
  return items
})

function onTableRowContextMenu(event, order) {
  contextOrder.value = order
  contextMenuRef.value.show(event)
}
</script>

<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('labOrders.pageTitle') }}</h1>
        <p class="page-subtitle">{{ $t('labOrders.pageSubtitle') }}</p>
      </div>
      <div class="header-actions">
        <div class="view-toggle">
          <button
              class="toggle-btn"
              :class="{ 'toggle-btn--active': currentView === 'kanban' }"
              @click="currentView = 'kanban'"
          >
            <i class="pi pi-th-large" /> {{ $t('labOrders.viewKanban') }}
          </button>
          <button
              class="toggle-btn"
              :class="{ 'toggle-btn--active': currentView === 'table' }"
              @click="currentView = 'table'"
          >
            <i class="pi pi-list" /> {{ $t('labOrders.viewTable') }}
          </button>
        </div>
        <button class="btn-register-lab" @click="showRegisterLabModal = true">
          <i class="pi pi-building" /> {{ $t('labOrders.registerLab') }}
        </button>
        <button class="btn-nueva" @click="showNewOrderModal = true">
          <i class="pi pi-plus" /> {{ $t('labOrders.newOrder') }}
        </button>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary-grid">
      <div v-for="item in summary" :key="item.labelKey" class="summary-card">
        <div class="summary-icon" :class="chipColor[item.color]">
          <i :class="item.icon" />
        </div>
        <div>
          <p class="summary-value">{{ item.value }}</p>
          <p class="summary-label">{{ $t(item.labelKey) }}</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrapper">
        <i class="pi pi-search search-icon" />
        <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('labOrders.searchPlaceholder')"
            class="search-input"
        />
      </div>
      <div class="filter-wrapper">
        <select v-model="statusFilter" class="filter-select">
          <option v-for="opt in statusFilterOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <i class="pi pi-chevron-down filter-arrow" />
      </div>
    </div>

    <!-- Kanban view -->
    <KanbanBoard
        v-if="currentView === 'kanban'"
        :work-orders="filteredOrders"
        @status-changed="onStatusChanged"
        @order-click="selectedOrder = $event"
    />

    <!-- Table view -->
    <div v-else class="table-wrapper">
      <div class="table-header-row">
        <span>{{ $t('labOrders.table.orderPatient') }}</span>
        <span>{{ $t('labOrders.table.status') }}</span>
        <span>{{ $t('labOrders.table.delivery') }}</span>
        <span>{{ $t('labOrders.table.balance') }}</span>
        <span></span>
      </div>
      <div
          v-for="workOrder in filteredOrders"
          :key="workOrder.id"
          class="table-row"
          @click="selectedOrder = workOrder"
          @contextmenu.prevent="onTableRowContextMenu($event, workOrder)"
      >
        <div class="row-main">
          <div class="row-dot" :class="`row-dot--${workOrder.priority || 'normal'}`" />
          <div>
            <div class="row-id-line">
              <span class="row-id">{{ workOrder.id }}</span>
              <span v-if="workOrder.isRework" class="tag tag--rework">
                {{ $t('labOrders.card.rework') }}
              </span>
              <span
                  v-if="workOrder.priority && workOrder.priority !== 'normal'"
                  class="tag"
                  :class="workOrder.priority === 'urgent' ? 'tag--urgent' : 'tag--high'"
              >
                {{ $t(`labOrders.priority.${workOrder.priority}`) }}
              </span>
            </div>
            <p class="row-patient">{{ workOrder.patientName }}</p>
            <p class="row-lab">{{ workOrder.laboratoryName }}</p>
          </div>
        </div>
        <span class="estado-badge" :class="`estado--${workOrder.status}`">
          {{ $t(`labOrders.status.${workOrder.status}`) }}
        </span>
        <span class="row-date">{{ workOrder.deliveryDate }}</span>
        <span :class="(workOrder.total - workOrder.deposit) > 0 ? 'saldo--pending' : 'saldo--paid'">
          {{ (workOrder.total - workOrder.deposit) > 0
            ? `S/ ${(workOrder.total - workOrder.deposit).toFixed(2)}`
            : $t('labOrders.card.paid') }}
        </span>
        <i class="pi pi-chevron-right row-arrow" />
      </div>
      <div v-if="filteredOrders.length === 0" class="table-empty">
        {{ $t('labOrders.table.noOrders') }}
      </div>
      <div class="table-footer">
        <span>
          {{ $t('labOrders.showing') }} {{ filteredOrders.length }}
          {{ $t('common.of') }}
          {{ store.workOrders.length }}
          {{ $t('labOrders.orders') }}
        </span>
      </div>
    </div>

    <!-- Modals -->
    <WorkOrderDetailModal
        v-if="selectedOrder"
        :work-order="selectedOrder"
        @close="selectedOrder = null"
        @status-changed="(status) => onStatusChanged({ workOrder: selectedOrder, status })"
    />
    <NewWorkOrderModal
        v-if="showNewOrderModal"
        @save="onNewOrder"
        @close="showNewOrderModal = false"
    />
    <QualityAssuranceModal
        v-if="showQaModal && qaTargetOrder"
        :work-order="qaTargetOrder"
        @approved="onQaApproved"
        @rejected="onQaRejected"
        @close="showQaModal = false; qaTargetOrder = null"
    />
    <RegisterLaboratoryModal
        v-if="showRegisterLabModal"
        @save="onNewLaboratory"
        @close="showRegisterLabModal = false"
    />

    <ContextMenu ref="contextMenuRef" :model="contextMenuItems" />
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
.btn-register-lab { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; color: #00c1b0; border: 1.5px solid #00c1b0; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; transition: background 0.15s, color 0.15s; }
.btn-register-lab:hover { background: rgba(0,193,176,0.06); }
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
.row-dot--urgent { background: #ef4444; }
.row-dot--high   { background: #f97316; }
.row-dot--normal { background: #d1d5db; }
.row-id-line { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.row-id { font-family: 'Courier New', monospace; font-size: 0.84rem; font-weight: 700; color: #111827; }
.tag { font-family: 'Montserrat', sans-serif; font-size: 0.66rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; }
.tag--rework { background: #fee2e2; color: #b91c1c; }
.tag--urgent { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
.tag--high   { background: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }
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

@media (max-width: 640px) {
  /* Página */
  .page { padding: 16px; gap: 16px; }

  .page-title { font-size: 1.25rem; }
  .header-actions { width: 100%; }
  .view-toggle { flex: 1; }
  .toggle-btn { flex: 1; justify-content: center; padding: 6px 8px; font-size: 0.78rem; }
  .btn-register-lab { flex: 1; justify-content: center; }
  .btn-nueva { flex: 1; justify-content: center; }

  .summary-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .summary-card { padding: 12px; }
  .summary-value { font-size: 1.2rem; }

  .table-header-row { display: none; }

  .table-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 8px;
    padding: 12px 16px;
  }

  .row-main { flex: 0 0 100%; order: 1; }

  .estado-badge { order: 2; flex-shrink: 0; font-size: 0.7rem; padding: 3px 8px; }
  .row-date     { order: 3; flex: 1; text-align: center; }
  .saldo--pending,
  .saldo--paid  { order: 4; flex-shrink: 0; }
  .row-arrow    { order: 5; margin-left: 4px; }
}
</style>