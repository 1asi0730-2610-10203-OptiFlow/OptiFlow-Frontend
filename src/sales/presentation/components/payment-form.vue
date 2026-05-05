<script setup>
import { ref, computed } from 'vue'
import { Payment, PaymentMethod } from '../../../sales/domain/model/payment.entity.js'

const props = defineProps({
  sale: { type: Object, required: true },
  payments: { type: Array, default: () => [] }
})

const emit = defineEmits(['payment-registered'])

const methodOptions = [
  { label: 'Efectivo',           value: PaymentMethod.CASH },
  { label: 'Tarjeta de Crédito', value: PaymentMethod.CREDIT_CARD },
  { label: 'Tarjeta de Débito',  value: PaymentMethod.DEBIT_CARD },
  { label: 'Transferencia',      value: PaymentMethod.TRANSFER }
]

const method = ref(PaymentMethod.CASH)
const amountPaid = ref(props.sale.pendingBalance)

const isValid = computed(() => amountPaid.value > 0 && amountPaid.value <= props.sale.pendingBalance && method.value)

function submit() {
  if (!isValid.value) return
  const payment = new Payment({
    saleId: props.sale.id,
    amountPaid: amountPaid.value,
    method: method.value,
    paidAt: new Date().toISOString()
  })
  emit('payment-registered', payment)
}
</script>

<template>
  <div class="payment-form">
    <div class="pending-info">
      <span class="pending-label">Saldo pendiente</span>
      <span class="pending-amount">S/ {{ Number(props.sale.pendingBalance).toFixed(2) }}</span>
    </div>

    <div class="form-field">
      <label>Método de pago</label>
      <pv-select v-model="method" :options="methodOptions" option-label="label" option-value="value" class="w-full" />
    </div>

    <div class="form-field">
      <label>Monto a cobrar (S/)</label>
      <pv-input-number v-model="amountPaid" :min="0.01" :max="props.sale.pendingBalance" :min-fraction-digits="2" :max-fraction-digits="2" class="w-full" />
    </div>

    <div v-if="!isValid && amountPaid > props.sale.pendingBalance" class="form-error">
      El monto supera el saldo pendiente.
    </div>

    <pv-button label="Registrar pago" icon="pi pi-check" :disabled="!isValid" class="w-full mt-3" @click="submit" />
  </div>
</template>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pending-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 12px 16px;
}

.pending-label {
  font-size: 0.875rem;
  color: #92400e;
}

.pending-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #b45309;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-error {
  color: #dc2626;
  font-size: 0.8rem;
}
</style>
