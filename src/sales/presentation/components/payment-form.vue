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
      <div class="price-input-wrap">
        <span class="price-prefix">S/</span>
        <input
          v-model.number="amountPaid"
          type="number"
          min="0.01"
          :max="props.sale.pendingBalance"
          step="0.01"
          class="price-input"
        />
      </div>
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

.price-input-wrap {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.15s;
}

.price-input-wrap:focus-within {
  border-color: #00c1b0;
  outline: none;
}

.price-prefix {
  padding: 0 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border-right: 1px solid #d1d5db;
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
  user-select: none;
}

.price-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 9px 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  color: #101828;
  background: transparent;
  width: 100%;
}

.price-input::-webkit-inner-spin-button,
.price-input::-webkit-outer-spin-button {
  opacity: 0.5;
}
</style>
