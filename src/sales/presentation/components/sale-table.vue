<script setup>
import SaleStatusBadge from './sale-status-badge.vue'

const props = defineProps({
  sales: { type: Array, required: true }
})

const emit = defineEmits(['return-sale', 'collect-payment'])

const paymentMethodLabel = {
  CASH: 'Efectivo',
  CREDIT_CARD: 'Tarjeta de Crédito',
  DEBIT_CARD: 'Tarjeta de Débito',
  TRANSFER: 'Transferencia'
}

const paymentMethodIcon = {
  CASH: 'pi pi-money-bill',
  CREDIT_CARD: 'pi pi-credit-card',
  DEBIT_CARD: 'pi pi-credit-card',
  TRANSFER: 'pi pi-arrow-right-arrow-left'
}

function formatCurrency(value) {
  return `S/ ${Number(value).toFixed(2)}`
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
    :current-page-report-template="'Mostrando {first}–{last} de {totalRecords} ventas'"
    responsive-layout="scroll"
    class="sale-table"
  >
    <pv-column field="invoiceNumber" header="Factura" sortable style="min-width: 120px">
      <template #body="{ data }">
        <span class="invoice-number">{{ data.invoiceNumber }}</span>
      </template>
    </pv-column>

    <pv-column field="patientName" header="Paciente" sortable style="min-width: 160px" />

    <pv-column field="totalAmount" header="Monto" sortable style="min-width: 110px">
      <template #body="{ data }">
        <span class="amount">{{ formatCurrency(data.totalAmount) }}</span>
      </template>
    </pv-column>

    <pv-column field="createdAt" header="Fecha" sortable style="min-width: 110px" />

    <pv-column field="status" header="Estado" style="min-width: 130px">
      <template #body="{ data }">
        <sale-status-badge :status="data.status" />
      </template>
    </pv-column>

    <pv-column field="paymentMethod" header="Método de Pago" style="min-width: 160px">
      <template #body="{ data }">
        <span class="payment-method">
          <i :class="paymentMethodIcon[data.paymentMethod] ?? 'pi pi-wallet'" />
          {{ paymentMethodLabel[data.paymentMethod] ?? data.paymentMethod }}
        </span>
      </template>
    </pv-column>

    <pv-column field="pendingBalance" header="Saldo Pendiente" sortable style="min-width: 130px">
      <template #body="{ data }">
        <span :class="data.pendingBalance > 0 ? 'balance-pending' : 'balance-clear'">
          {{ formatCurrency(data.pendingBalance) }}
        </span>
      </template>
    </pv-column>

    <pv-column header="Acciones" style="min-width: 180px">
      <template #body="{ data }">
        <div class="action-buttons">
          <pv-button
            v-if="data.status === 'PENDING' || data.status === 'PARTIAL'"
            label="Cobrar"
            icon="pi pi-dollar"
            size="small"
            severity="success"
            @click="emit('collect-payment', data)"
          />
          <pv-button
            v-if="data.status === 'DELIVERED'"
            label="Devolución"
            icon="pi pi-replay"
            size="small"
            severity="danger"
            outlined
            @click="emit('return-sale', data.id)"
          />
        </div>
      </template>
    </pv-column>
  </pv-data-table>
</template>

<style scoped>
.invoice-number {
  font-weight: 600;
  color: #2563eb;
  font-size: 0.875rem;
}

.amount {
  font-weight: 600;
  color: #111827;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #374151;
}

.balance-pending {
  color: #dc2626;
  font-weight: 600;
}

.balance-clear {
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
