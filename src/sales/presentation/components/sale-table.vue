<script setup>
import SaleStatusBadge from './sale-status-badge.vue'

const props = defineProps({
  sales: { type: Array, required: true }
})

const emit = defineEmits(['return-sale', 'collect-payment', 'cancel-sale'])

const paymentMethodLabel = {
  CASH:        'Efectivo',
  CREDIT_CARD: 'Tarjeta Crédito',
  DEBIT_CARD:  'Tarjeta Débito',
  TRANSFER:    'Transferencia',
  INSURANCE:   'Seguro'
}

const paymentMethodIcon = {
  CASH:        'pi pi-money-bill',
  CREDIT_CARD: 'pi pi-credit-card',
  DEBIT_CARD:  'pi pi-credit-card',
  TRANSFER:    'pi pi-arrow-right-arrow-left',
  INSURANCE:   'pi pi-shield'
}

function formatCurrency(value) {
  return `S/ ${Number(value).toFixed(2)}`
}

function adelantoPercent(sale) {
  if (!sale.totalAmount) return 0
  return Math.min(100, Math.round((sale.adelanto / sale.totalAmount) * 100))
}

function isOpen(sale) {
  return sale.status === 'PENDING' || sale.status === 'PARTIAL'
}

function isDelivered(sale) {
  return sale.status === 'DELIVERED'
}
</script>

<template>
  <pv-data-table
    :value="props.sales"
    striped-rows
    paginator
    :rows="10"
    :rows-per-page-options="[5, 10, 25]"
    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    responsive-layout="scroll"
    class="sale-table"
  >
    <!-- Factura -->
    <pv-column field="invoiceNumber" header="Factura" sortable style="min-width: 140px">
      <template #body="{ data }">
        <div class="col-invoice">
          <span class="invoice-num">{{ data.invoiceNumber }}</span>
          <a class="lab-link">→ {{ data.labOrderNumber || '—' }}</a>
        </div>
      </template>
    </pv-column>

    <!-- Paciente -->
    <pv-column field="patientName" header="Paciente" sortable style="min-width: 160px">
      <template #body="{ data }">
        <div class="col-patient">
          <span class="patient-name">{{ data.patientName }}</span>
          <span class="patient-rx">{{ data.patientRx || '—' }}</span>
        </div>
      </template>
    </pv-column>

    <!-- Productos -->
    <pv-column field="articulos" header="Productos" style="min-width: 180px">
      <template #body="{ data }">
        <ul class="articulos-list">
          <li v-for="(art, i) in (data.articulos || [])" :key="i">{{ art }}</li>
        </ul>
      </template>
    </pv-column>

    <!-- Fecha -->
    <pv-column field="createdAt" header="Fecha" sortable style="min-width: 110px">
      <template #body="{ data }">
        <span class="col-date">
          <i class="pi pi-calendar" style="font-size: 0.75rem" />
          {{ data.createdAt }}
        </span>
      </template>
    </pv-column>

    <!-- Total -->
    <pv-column field="totalAmount" header="Total" sortable style="min-width: 110px">
      <template #body="{ data }">
        <span class="col-total">{{ formatCurrency(data.totalAmount) }}</span>
      </template>
    </pv-column>

    <!-- Adelanto -->
    <pv-column field="adelanto" header="Adelanto" sortable style="min-width: 140px">
      <template #body="{ data }">
        <div class="col-adelanto">
          <span class="adelanto-amount">{{ formatCurrency(data.adelanto) }}</span>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: adelantoPercent(data) + '%' }" />
          </div>
        </div>
      </template>
    </pv-column>

    <!-- Saldo -->
    <pv-column field="pendingBalance" header="Saldo" sortable style="min-width: 130px">
      <template #body="{ data }">
        <div class="col-saldo">
          <template v-if="data.pendingBalance > 0">
            <span class="saldo-pending">{{ formatCurrency(data.pendingBalance) }}</span>
            <button class="cobrar-btn" @click="emit('collect-payment', data)">Cobrar →</button>
          </template>
          <span v-else class="saldo-paid-badge">Pagado</span>
        </div>
      </template>
    </pv-column>

    <!-- Método de Pago -->
    <pv-column field="paymentMethod" header="Pago" style="min-width: 150px">
      <template #body="{ data }">
        <span class="col-payment">
          <i :class="paymentMethodIcon[data.paymentMethod] ?? 'pi pi-wallet'" />
          {{ paymentMethodLabel[data.paymentMethod] ?? data.paymentMethod }}
        </span>
      </template>
    </pv-column>

    <!-- Estado -->
    <pv-column field="status" header="Estado" style="min-width: 130px">
      <template #body="{ data }">
        <sale-status-badge :status="data.status" />
      </template>
    </pv-column>

    <!-- Acciones -->
    <pv-column header="Acciones" style="min-width: 120px">
      <template #body="{ data }">
        <div class="action-buttons">
          <button
            v-if="isOpen(data)"
            class="action-btn action-btn--cancel"
            @click="emit('cancel-sale', data.id)"
          >
            Cancelar
          </button>
          <button
            v-if="isDelivered(data)"
            class="action-btn action-btn--return"
            @click="emit('return-sale', data.id)"
          >
            Devolución
          </button>
        </div>
      </template>
    </pv-column>
  </pv-data-table>
</template>

<style scoped>
.col-invoice {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.invoice-num {
  font-family: 'Consolas', monospace;
  font-size: 0.82rem;
  font-weight: 600;
  color: #101828;
}

.lab-link {
  font-family: 'Consolas', monospace;
  font-size: 0.75rem;
  color: #00c1b0;
  cursor: default;
}

.col-patient {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.patient-name {
  font-size: 0.845rem;
  font-weight: 600;
  color: #101828;
}

.patient-rx {
  font-family: 'Consolas', monospace;
  font-size: 0.72rem;
  color: #99a1af;
}

.articulos-list {
  list-style: disc;
  padding-left: 14px;
  margin: 0;
  font-size: 0.78rem;
  color: #364153;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.col-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  color: #4a5565;
}

.col-total {
  font-size: 0.875rem;
  font-weight: 700;
  color: #101828;
}

.col-adelanto {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.adelanto-amount {
  font-size: 0.845rem;
  font-weight: 600;
  color: #00a63e;
}

.progress-track {
  width: 80px;
  height: 5px;
  background: #f3f4f6;
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #05df72;
  border-radius: 99px;
  transition: width 0.3s;
}

.col-saldo {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.saldo-pending {
  font-size: 0.845rem;
  font-weight: 600;
  color: #f54900;
}

.cobrar-btn {
  background: none;
  border: none;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00c1b0;
  cursor: pointer;
  text-align: left;
}

.cobrar-btn:hover {
  text-decoration: underline;
}

.saldo-paid-badge {
  display: inline-block;
  padding: 2px 9px;
  background: #dcfce7;
  color: #008236;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.col-payment {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #4a5565;
}

.action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.action-btn--cancel {
  color: #e7000b;
}

.action-btn--cancel:hover {
  text-decoration: underline;
}

.action-btn--return {
  color: #f54900;
}

.action-btn--return:hover {
  text-decoration: underline;
}
</style>
