<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useSalesStore } from '../../application/sales.store.js'
import SaleTable from '../components/sale-table.vue'
import SaleFormModal from '../components/sale-form-modal.vue'
import PaymentForm from '../components/payment-form.vue'
import FeedbackForm from '../components/feedback-form.vue'

const store = useSalesStore()
const confirm = useConfirm()
const toast = useToast()

const search = ref('')
const statusFilter = ref(null)
const showNewSaleModal = ref(false)
const showPaymentDialog = ref(false)
const showFeedbackDialog = ref(false)
const selectedSale = ref(null)

const statusOptions = [
  { label: 'Todos los estados', value: null },
  { label: 'Pendiente',        value: 'PENDING' },
  { label: 'Saldo Pendiente',  value: 'PARTIAL' },
  { label: 'Pagada',           value: 'PAID' },
  { label: 'Completada',       value: 'DELIVERED' },
  { label: 'Devuelta',         value: 'RETURNED' }
]

const filteredSales = computed(() => {
  let list = store.sales
  const term = search.value.toLowerCase()
  if (term) {
    list = list.filter(s =>
      s.invoiceNumber.toLowerCase().includes(term) ||
      s.patientName.toLowerCase().includes(term)
    )
  }
  if (statusFilter.value) {
    list = list.filter(s => s.status === statusFilter.value)
  }
  return list
})

onMounted(() => {
  store.fetchSales()
})

async function onSaleCreated(sale) {
  await store.createSale(sale)
  showNewSaleModal.value = false
  toast.add({ severity: 'success', summary: 'Venta creada', detail: `${sale.invoiceNumber} registrada correctamente.`, life: 3000 })
}

function onCollectPayment(sale) {
  selectedSale.value = sale
  store.fetchPaymentsBySale(sale.id)
  showPaymentDialog.value = true
}

async function onPaymentRegistered(payment) {
  await store.registerPayment(payment)
  showPaymentDialog.value = false
  selectedSale.value = null
  toast.add({ severity: 'success', summary: 'Pago registrado', detail: 'El saldo fue actualizado correctamente.', life: 3000 })
}

function onReturnSale(saleId) {
  confirm.require({
    message: '¿Desea registrar la devolución de esta venta?',
    header: 'Confirmar devolución',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, devolver',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await store.markAsReturned(saleId)
      toast.add({ severity: 'info', summary: 'Devolución registrada', detail: 'La orden fue marcada como devuelta.', life: 3000 })
    }
  })
}

function onCancelSale(saleId) {
  confirm.require({
    message: '¿Desea cancelar esta venta?',
    header: 'Confirmar cancelación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, cancelar',
    rejectLabel: 'No',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await store.cancelSale(saleId)
      toast.add({ severity: 'warn', summary: 'Venta cancelada', detail: 'La venta fue marcada como devuelta.', life: 3000 })
    }
  })
}

function onFeedbackSubmitted(feedback) {
  store.submitFeedback(feedback)
  showFeedbackDialog.value = false
  toast.add({ severity: 'success', summary: 'Encuesta enviada', detail: '¡Gracias por tu valoración!', life: 3000 })
}

function formatCurrency(value) {
  return `S/ ${Number(value).toFixed(2)}`
}
</script>

<template>
  <div class="sale-list-page">

    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-title">Gestión de Ventas</h1>
        <p class="page-subtitle">POS · Cotizaciones · Adelantos · Saldos Pendientes</p>
      </div>
      <div class="page-header__right">
        <button class="btn-secondary">
          <i class="pi pi-refresh" />
          Recuperar Cotización
        </button>
        <button class="btn-primary" @click="showNewSaleModal = true">
          <i class="pi pi-plus" />
          Nueva Venta
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--green">
          <i class="pi pi-dollar" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Ingresos Totales</span>
          <span class="kpi-value">{{ formatCurrency(store.totalIngresos) }}</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--teal">
          <i class="pi pi-wallet" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Adelantos Cobrados</span>
          <span class="kpi-value">{{ formatCurrency(store.totalAdelantos) }}</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--orange">
          <i class="pi pi-clock" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Saldo Pendiente</span>
          <span class="kpi-value">{{ formatCurrency(store.totalSaldo) }}</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--purple">
          <i class="pi pi-chart-line" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Ticket Promedio</span>
          <span class="kpi-value">{{ formatCurrency(store.ticketPromedio) }}</span>
        </div>
      </div>
    </div>

    <!-- Search + Filters -->
    <div class="search-card">
      <div class="search-row">
        <div class="search-input-wrap">
          <i class="pi pi-search search-icon" />
          <input
            v-model="search"
            class="search-input"
            placeholder="Buscar por N° factura o paciente..."
          />
        </div>
        <pv-select
          v-model="statusFilter"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Todos los estados"
          class="status-select"
        />
        <button class="btn-export">
          <i class="pi pi-download" />
          Exportar
        </button>
      </div>
    </div>

    <!-- Error display -->
    <div v-if="store.errors.length" class="errors">
      <pv-message v-for="(err, i) in store.errors" :key="i" severity="error" :closable="false">
        {{ err }}
      </pv-message>
    </div>

    <!-- Sales Table -->
    <div class="table-card">
      <div v-if="store.loading" class="loading-state">
        <pv-progress-spinner style="width: 48px; height: 48px" />
        <span>Cargando ventas...</span>
      </div>

      <sale-table
        v-else
        :sales="filteredSales"
        @return-sale="onReturnSale"
        @cancel-sale="onCancelSale"
        @collect-payment="onCollectPayment"
      />
    </div>

    <!-- New Sale Modal -->
    <sale-form-modal
      :visible="showNewSaleModal"
      @saved="onSaleCreated"
      @close="showNewSaleModal = false"
    />

    <!-- Payment Dialog -->
    <pv-dialog
      v-model:visible="showPaymentDialog"
      header="Registrar pago de saldo"
      :style="{ width: '420px' }"
      modal
    >
      <payment-form
        v-if="selectedSale"
        :sale="selectedSale"
        :payments="store.payments"
        @payment-registered="onPaymentRegistered"
      />
    </pv-dialog>

    <!-- Feedback Dialog -->
    <pv-dialog
      v-model:visible="showFeedbackDialog"
      header="Encuesta de satisfacción"
      :style="{ width: '460px' }"
      modal
    >
      <feedback-form
        v-if="selectedSale"
        :sale-id="selectedSale.id"
        :patient-id="selectedSale.patientId"
        @feedback-submitted="onFeedbackSubmitted"
        @skip="showFeedbackDialog = false"
      />
    </pv-dialog>
  </div>
</template>

<style scoped>
.sale-list-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 28px 28px;
  background: #f9fafb;
  min-height: 100%;
  box-sizing: border-box;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header__left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #101828;
  margin: 0;
}

.page-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  color: #6a7282;
  margin: 0;
}

.page-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #00c1b0;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover {
  background: #00a89a;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #ffffff;
  color: #4a5565;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover {
  background: #f9fafb;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  padding: 16px 18px;
}

.kpi-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.kpi-icon--green  { background: #f0fdf4; color: #008236; }
.kpi-icon--teal   { background: rgba(0, 193, 176, 0.08); color: #00c1b0; }
.kpi-icon--orange { background: #fff7ed; color: #f54900; }
.kpi-icon--purple { background: #faf5ff; color: #7c3aed; }

.kpi-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.kpi-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  color: #6a7282;
  font-weight: 500;
}

.kpi-value {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #101828;
}

/* Search Card */
.search-card {
  background: #ffffff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  padding: 14px 18px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 12px;
}

.search-icon {
  color: #9ca3af;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem;
  color: #101828;
  padding: 9px 0;
}

.search-input::placeholder {
  color: #9ca3af;
}

.status-select {
  width: 200px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: #ffffff;
  color: #4a5565;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.btn-export:hover {
  background: #f9fafb;
}

/* Table Card */
.table-card {
  background: #ffffff;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  overflow: hidden;
}

.errors {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 0;
  color: #6b7280;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
