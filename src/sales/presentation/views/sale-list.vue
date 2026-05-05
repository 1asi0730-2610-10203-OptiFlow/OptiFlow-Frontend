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
const showNewSaleModal = ref(false)
const showPaymentDialog = ref(false)
const showFeedbackDialog = ref(false)
const selectedSale = ref(null)

const filteredSales = computed(() => {
  const term = search.value.toLowerCase()
  if (!term) return store.sales
  return store.sales.filter(s =>
    s.invoiceNumber.toLowerCase().includes(term) ||
    s.patientName.toLowerCase().includes(term)
  )
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
    message: '¿Desea registrar la devolución de esta venta? Esta acción revertirá la transacción.',
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

function onFeedbackSubmitted(feedback) {
  store.submitFeedback(feedback)
  showFeedbackDialog.value = false
  toast.add({ severity: 'success', summary: 'Encuesta enviada', detail: '¡Gracias por tu valoración!', life: 3000 })
}
</script>

<template>
  <div class="sale-list-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-title">Gestión de Ventas</h1>
        <div class="page-stats">
          <span class="stat-chip stat-chip--warn">
            <i class="pi pi-clock" /> {{ store.openSalesCount }} órdenes abiertas
          </span>
          <span class="stat-chip stat-chip--success">
            <i class="pi pi-check-circle" /> {{ store.completedSalesCount }} venta(s) completada(s)
          </span>
          <span class="stat-chip">
            <i class="pi pi-list" /> {{ store.salesCount }} transacciones
          </span>
        </div>
      </div>
      <div class="page-header__right">
        <pv-input-text
          v-model="search"
          placeholder="Buscar por N° factura o paciente..."
          class="search-input"
        >
          <template #prefix>
            <i class="pi pi-search" />
          </template>
        </pv-input-text>
        <pv-button label="Exportar" icon="pi pi-download" outlined severity="secondary" />
        <pv-button label="Nueva Venta" icon="pi pi-plus" @click="showNewSaleModal = true" />
      </div>
    </div>

    <!-- Error display -->
    <div v-if="store.errors.length" class="errors">
      <pv-message v-for="(err, i) in store.errors" :key="i" severity="error" :closable="false">
        {{ err }}
      </pv-message>
    </div>

    <!-- Sales Table -->
    <div class="page-content">
      <div v-if="store.loading" class="loading-state">
        <pv-progress-spinner style="width: 50px; height: 50px" />
        <span>Cargando ventas...</span>
      </div>

      <sale-table
        v-else
        :sales="filteredSales"
        @return-sale="onReturnSale"
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
  gap: 0;
  height: 100%;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 28px 16px;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.page-header__left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.page-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  background: #f3f4f6;
  color: #374151;
}

.stat-chip--warn {
  background: #fef3c7;
  color: #92400e;
}

.stat-chip--success {
  background: #d1fae5;
  color: #065f46;
}

.page-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 280px;
}

.errors {
  padding: 0 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-content {
  flex: 1;
  padding: 20px 28px;
  overflow: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 0;
  color: #6b7280;
}
</style>
