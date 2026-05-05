<script setup>
import { ref, computed, onMounted } from 'vue'
import { Sale } from '../../../sales/domain/model/sale.entity.js'
import { PaymentMethod } from '../../../sales/domain/model/payment.entity.js'
import axios from 'axios'

defineProps({
  visible: { type: Boolean, required: true }
})

const emit = defineEmits(['saved', 'close'])

const step = ref(0)

const steps = [
  { label: 'Paciente y Rx' },
  { label: 'Productos' },
  { label: 'Pago' }
]

// Step 1
const patients = ref([])
const selectedPatient = ref(null)

// Step 2
const saleDetails = ref([{ productName: '', quantity: 1, unitPrice: 0 }])

// Step 3
const paymentMethod = ref(PaymentMethod.CASH)
const discountCode = ref('')
const discountAmount = ref(0)
const notes = ref('')

const paymentMethodOptions = [
  { label: 'Efectivo',           value: PaymentMethod.CASH },
  { label: 'Tarjeta de Crédito', value: PaymentMethod.CREDIT_CARD },
  { label: 'Tarjeta de Débito',  value: PaymentMethod.DEBIT_CARD },
  { label: 'Transferencia',      value: PaymentMethod.TRANSFER }
]

const totalAmount = computed(() =>
  saleDetails.value.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0)
)

const finalAmount = computed(() => Math.max(0, totalAmount.value - discountAmount.value))

onMounted(async () => {
  const res = await axios.get(`${import.meta.env.VITE_OPTIFLOW_API_URL}/patients`)
  patients.value = res.data
})

function addDetail() {
  saleDetails.value.push({ productName: '', quantity: 1, unitPrice: 0 })
}

function removeDetail(index) {
  saleDetails.value.splice(index, 1)
}

function nextStep() {
  if (step.value < 2) step.value++
}

function prevStep() {
  if (step.value > 0) step.value--
}

function generateInvoiceNumber() {
  return `FAC-${Math.floor(1000 + Math.random() * 9000)}`
}

function save() {
  if (!selectedPatient.value) return
  const sale = new Sale({
    invoiceNumber: generateInvoiceNumber(),
    patientId: selectedPatient.value.id,
    patientName: selectedPatient.value.name,
    userId: 1,
    userName: 'Usuario actual',
    totalAmount: finalAmount.value,
    discountCode: discountCode.value,
    discountAmount: discountAmount.value,
    pendingBalance: finalAmount.value,
    status: 'PENDING',
    paymentMethod: paymentMethod.value,
    createdAt: new Date().toISOString().split('T')[0],
    notes: notes.value
  })
  emit('saved', sale)
}

function close() {
  step.value = 0
  selectedPatient.value = null
  saleDetails.value = [{ productName: '', quantity: 1, unitPrice: 0 }]
  discountCode.value = ''
  discountAmount.value = 0
  notes.value = ''
  emit('close')
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    header="Nueva Venta / Cotización"
    :style="{ width: '560px' }"
    modal
    :closable="false"
    @update:visible="close"
  >
    <div class="modal-body">
      <pv-steps :model="steps" :active-step="step" class="mb-4" />

      <!-- Step 0: Paciente y Rx -->
      <div v-if="step === 0" class="step-content">
        <div class="form-field">
          <label>Paciente</label>
          <pv-select
            v-model="selectedPatient"
            :options="patients"
            option-label="name"
            placeholder="Selecciona un paciente..."
            class="w-full"
            filter
          />
        </div>

        <div v-if="selectedPatient" class="rx-card">
          <div class="rx-card__header">
            <i class="pi pi-file-edit" />
            <span>Última Receta (Vinculada automáticamente)</span>
          </div>
          <div class="rx-card__body">
            <div class="rx-row">
              <span class="rx-eye">OD:</span>
              <span>Esf — / Cil — / Eje —°</span>
            </div>
            <div class="rx-row">
              <span class="rx-eye">OS:</span>
              <span>Esf — / Cil — / Eje —°</span>
            </div>
            <span class="rx-note">Receta pendiente de vincular con módulo clínico</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Productos -->
      <div v-else-if="step === 1" class="step-content">
        <div v-for="(detail, i) in saleDetails" :key="i" class="product-row">
          <pv-input-text v-model="detail.productName" placeholder="Producto / montura / luna..." class="flex-1" />
          <pv-input-number v-model="detail.quantity" :min="1" placeholder="Cant." style="width: 80px" />
          <pv-input-number v-model="detail.unitPrice" :min="0" :min-fraction-digits="2" placeholder="Precio" style="width: 110px" prefix="S/ " />
          <pv-button icon="pi pi-trash" severity="danger" text @click="removeDetail(i)" :disabled="saleDetails.length === 1" />
        </div>

        <pv-button label="Agregar ítem" icon="pi pi-plus" text @click="addDetail" />

        <div class="total-row">
          <span>Subtotal</span>
          <span>S/ {{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Step 2: Pago -->
      <div v-else class="step-content">
        <div class="form-field">
          <label>Método de pago</label>
          <pv-select v-model="paymentMethod" :options="paymentMethodOptions" option-label="label" option-value="value" class="w-full" />
        </div>

        <div class="form-field">
          <label>Código de descuento (opcional)</label>
          <div class="discount-row">
            <pv-input-text v-model="discountCode" placeholder="ej. DESC15" class="flex-1" />
            <pv-input-number v-model="discountAmount" :min="0" :max="totalAmount" :min-fraction-digits="2" prefix="S/ " style="width: 130px" />
          </div>
        </div>

        <div class="form-field">
          <label>Notas (opcional)</label>
          <pv-textarea v-model="notes" rows="2" class="w-full" auto-resize />
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>S/ {{ totalAmount.toFixed(2) }}</span>
          </div>
          <div v-if="discountAmount > 0" class="summary-row summary-row--discount">
            <span>Descuento</span>
            <span>- S/ {{ discountAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-row summary-row--total">
            <span>Total a pagar</span>
            <span>S/ {{ finalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <pv-button label="Cancelar" text severity="secondary" @click="close" />
        <div class="footer-nav">
          <pv-button v-if="step > 0" label="Anterior" icon="pi pi-chevron-left" outlined @click="prevStep" />
          <pv-button
            v-if="step < 2"
            label="Siguiente"
            icon="pi pi-chevron-right"
            icon-pos="right"
            :disabled="step === 0 && !selectedPatient"
            @click="nextStep"
          />
          <pv-button
            v-else
            label="Crear venta + orden de lab"
            icon="pi pi-check"
            :disabled="finalAmount <= 0"
            @click="save"
          />
        </div>
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.modal-body {
  padding: 0 4px;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 220px;
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

.rx-card {
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #eff6ff;
  overflow: hidden;
}

.rx-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #dbeafe;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1d4ed8;
}

.rx-card__body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rx-row {
  display: flex;
  gap: 8px;
  font-size: 0.875rem;
  color: #374151;
}

.rx-eye {
  font-weight: 600;
  color: #1d4ed8;
  width: 24px;
}

.rx-note {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 4px;
}

.product-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  padding: 10px 0;
  border-top: 1px solid #e9ecef;
  font-size: 0.95rem;
}

.discount-row {
  display: flex;
  gap: 8px;
}

.summary-box {
  background: #f9fafb;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #374151;
}

.summary-row--discount {
  color: #16a34a;
}

.summary-row--total {
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-nav {
  display: flex;
  gap: 8px;
}
</style>
