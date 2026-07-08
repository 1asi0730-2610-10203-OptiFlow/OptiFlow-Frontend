<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useSalesStore } from '../../application/sales.store.js'
import { eventBus } from '../../../shared/infrastructure/event-bus.js'
import { WorkOrderApi } from '../../../fulfillment/infrastructure/work-order-api.js'
import SaleTable from '../components/sale-table.vue'
import SaleFormModal from '../components/sale-form-modal.vue'
import PaymentForm from '../components/payment-form.vue'
import FeedbackForm from '../components/feedback-form.vue'

const { t } = useI18n()
const store = useSalesStore()
const confirm = useConfirm()
const toast = useToast()
const workOrderApi = new WorkOrderApi()

const search = ref('')
const statusFilter = ref(null)
const dateFrom = ref('')
const dateTo = ref('')
const showNewSaleModal = ref(false)
const showPaymentDialog = ref(false)
const showFeedbackDialog = ref(false)
const selectedSale = ref(null)

const statusOptions = computed(() => [
  { label: t('sales.allStatuses'), value: null },
  { label: t('sales.status.PENDING'),        value: 'PENDING' },
  { label: t('sales.status.PARTIAL'),  value: 'PARTIAL' },
  { label: t('sales.status.PAID'),           value: 'PAID' },
  { label: t('sales.status.DELIVERED'),       value: 'DELIVERED' },
  { label: t('sales.status.RETURNED'),         value: 'RETURNED' }
])

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
  if (dateFrom.value) {
    list = list.filter(s => s.createdAt >= dateFrom.value)
  }
  if (dateTo.value) {
    list = list.filter(s => s.createdAt <= dateTo.value)
  }
  return list
})

const hasActiveFilters = computed(() =>
  !!search.value || !!statusFilter.value || !!dateFrom.value || !!dateTo.value
)

function clearFilters() {
  search.value = ''
  statusFilter.value = null
  dateFrom.value = ''
  dateTo.value = ''
}

let unsubNewSale
onMounted(() => {
  store.fetchSales()
  unsubNewSale = eventBus.on('ui:open:new-sale', () => { showNewSaleModal.value = true })
})
onUnmounted(() => { unsubNewSale?.() })

async function onSaleCreated(sale, workOrderId) {
  const created = await store.createSale(sale)
  if (!created) return

  if (workOrderId) {
    try {
      await workOrderApi.linkSale(workOrderId, created.id)
    } catch (e) {
      console.error('Error linking work order to sale:', e)
    }
  }

  showNewSaleModal.value = false
  toast.add({ severity: 'success', summary: t('sales.toast.saleCreated'), detail: `${sale.invoiceNumber} ${t('sales.toast.saleCreatedDetail')}`, life: 3000 })
}

function onCollectPayment(sale) {
  selectedSale.value = sale
  store.fetchPaymentsBySale(sale.id)
  showPaymentDialog.value = true
}

async function onPaymentRegistered(payment) {
  const success = await store.registerPayment(payment)
  if (!success) return
  showPaymentDialog.value = false
  selectedSale.value = null
  toast.add({ severity: 'success', summary: t('sales.toast.paymentRegistered'), detail: t('sales.toast.paymentRegisteredDetail'), life: 3000 })
}

function onReturnSale(saleId) {
  confirm.require({
    message: t('sales.confirm.returnMessage'),
    header: t('sales.confirm.returnHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('sales.confirm.returnAccept'),
    rejectLabel: t('common.cancel'),
    acceptClass: 'p-button-danger',
    accept: async () => {
      await store.markAsReturned(saleId)
      toast.add({ severity: 'info', summary: t('sales.toast.returnRegistered'), detail: t('sales.toast.returnRegisteredDetail'), life: 3000 })
    }
  })
}

function onCancelSale(saleId) {
  confirm.require({
    message: t('sales.confirm.cancelMessage'),
    header: t('sales.confirm.cancelHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('sales.confirm.cancelAccept'),
    rejectLabel: t('common.no'),
    acceptClass: 'p-button-danger',
    accept: async () => {
      await store.cancelSale(saleId)
      toast.add({ severity: 'warn', summary: t('sales.toast.saleCancelled'), detail: t('sales.toast.saleCancelledDetail'), life: 3000 })
    }
  })
}

function onFeedbackSubmitted(feedback) {
  store.submitFeedback(feedback)
  showFeedbackDialog.value = false
  toast.add({ severity: 'success', summary: t('sales.toast.feedbackSent'), detail: t('sales.toast.feedbackSentDetail'), life: 3000 })
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
        <h1 class="page-title">{{ $t('sales.pageTitle') }}</h1>
        <p class="page-subtitle">{{ $t('sales.pageSubtitle') }}</p>
      </div>
      <div class="page-header__right">

        <button class="btn-primary" @click="showNewSaleModal = true">
          <i class="pi pi-plus" />
          {{ $t('sales.newSale') }}
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
          <span class="kpi-label">{{ $t('sales.kpi.totalRevenue') }}</span>
          <span class="kpi-value">{{ formatCurrency(store.totalIngresos) }}</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--teal">
          <i class="pi pi-wallet" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">{{ $t('sales.kpi.deposits') }}</span>
          <span class="kpi-value">{{ formatCurrency(store.totalAdelantos) }}</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--orange">
          <i class="pi pi-clock" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">{{ $t('sales.kpi.pendingBalance') }}</span>
          <span class="kpi-value">{{ formatCurrency(store.totalSaldo) }}</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--purple">
          <i class="pi pi-chart-line" />
        </div>
        <div class="kpi-body">
          <span class="kpi-label">{{ $t('sales.kpi.averageTicket') }}</span>
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
            :placeholder="$t('sales.searchPlaceholder')"
          />
        </div>
        <pv-select
          v-model="statusFilter"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          :placeholder="$t('sales.allStatuses')"
          class="status-select"
        />

        <div class="date-filter-group">
          <i class="pi pi-calendar filter-icon" />
          <label>{{ $t('sales.dateFrom') }}</label>
          <input v-model="dateFrom" type="date" class="date-input" :max="dateTo || undefined" />
        </div>
        <div class="date-filter-group">
          <label>{{ $t('sales.dateTo') }}</label>
          <input v-model="dateTo" type="date" class="date-input" :min="dateFrom || undefined" />
        </div>

        <button v-if="hasActiveFilters" class="btn-clear" @click="clearFilters">
          {{ $t('common.clearFilters') }}
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
        <span>{{ $t('sales.loading') }}</span>
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
      :header="$t('sales.dialogs.paymentHeader')"
      :style="{ width: 'min(420px, 95vw)' }"
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
      :header="$t('sales.dialogs.feedbackHeader')"
      :style="{ width: 'min(460px, 95vw)' }"
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

.date-filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-filter-group label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.date-input {
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  color: #101828;
  outline: none;
}

.date-input:focus {
  border-color: #00c1b0;
}

.btn-clear {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #6a7282;
  cursor: pointer;
  white-space: nowrap;
}

.btn-clear:hover {
  background: #f9fafb;
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

@media (max-width: 700px) {
  .sale-list-page {
    padding: 16px 14px 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header__right {
    flex-wrap: wrap;
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
    justify-content: center;
  }

  .status-select {
    width: 100%;
  }

  .date-filter-group {
    width: 100%;
  }

  .date-input {
    flex: 1;
  }

  .btn-clear {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
