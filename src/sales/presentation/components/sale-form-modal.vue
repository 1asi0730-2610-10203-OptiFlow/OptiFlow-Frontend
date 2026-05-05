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
const TOTAL_STEPS = 3

const stepLabels = ['Paciente y Rx', 'Armaz & Lentes', 'Pago']

// Step 0
const patients = ref([])
const selectedPatient = ref(null)

// Step 1
const frameOption = ref('')
const lenseMaterial = ref('')
const lenseType = ref('')

const frameOptions = [
  { label: 'Ray-Ban RB5228',  value: 'Ray-Ban RB5228' },
  { label: 'Nike 7284',       value: 'Nike 7284' },
  { label: 'Otro / Sin armazón', value: 'Otro' }
]

const lenseMaterialOptions = [
  { label: 'CR-39 (Plástico)',    value: 'CR-39' },
  { label: 'Policarbonato',       value: 'Policarbonato' },
  { label: 'Trivex',              value: 'Trivex' },
  { label: 'Alto índice (1.67)', value: '1.67' }
]

const lenseTypeOptions = [
  { label: 'Monofocal',          value: 'Monofocal' },
  { label: 'Progresivo',         value: 'Progresivo' },
  { label: 'Con Filtro Azul',    value: 'Filtro Azul' },
  { label: 'Polarizado',         value: 'Polarizado' }
]

const saleDetails = ref([{ productName: '', quantity: 1, unitPrice: 0 }])

// Step 2
const paymentMethod = ref(PaymentMethod.CASH)
const adelanto = ref(0)
const discountCode = ref('')
const discountAmount = ref(0)
const notes = ref('')

const paymentMethodOptions = [
  { label: 'Efectivo',           value: PaymentMethod.CASH },
  { label: 'Tarjeta de Crédito', value: PaymentMethod.CREDIT_CARD },
  { label: 'Tarjeta de Débito',  value: PaymentMethod.DEBIT_CARD },
  { label: 'Transferencia',      value: PaymentMethod.TRANSFER },
  { label: 'Seguro',             value: PaymentMethod.INSURANCE }
]

const totalAmount = computed(() =>
  saleDetails.value.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0)
)

const finalAmount = computed(() => Math.max(0, totalAmount.value - discountAmount.value))

const pendingBalance = computed(() => Math.max(0, finalAmount.value - adelanto.value))

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
  if (step.value < TOTAL_STEPS - 1) step.value++
}

function prevStep() {
  if (step.value > 0) step.value--
}

function generateInvoiceNumber() {
  return `FAC-${Math.floor(1000 + Math.random() * 9000)}`
}

function generateLabOrderNumber() {
  return `LAB-${Math.floor(1000 + Math.random() * 9000)}`
}

function buildArticulos() {
  const arts = []
  if (frameOption.value) arts.push(frameOption.value)
  if (lenseType.value) {
    arts.push(`Lunas ${lenseType.value}`)
  }
  saleDetails.value.forEach(d => {
    if (d.productName && !arts.includes(d.productName)) arts.push(d.productName)
  })
  return arts
}

function save() {
  if (!selectedPatient.value) return
  const inv = generateInvoiceNumber()
  const sale = new Sale({
    invoiceNumber: inv,
    labOrderNumber: generateLabOrderNumber(),
    patientId: selectedPatient.value.id,
    patientName: selectedPatient.value.name,
    patientRx: selectedPatient.value.rx ?? '',
    userId: 1,
    userName: 'John Doe',
    articulos: buildArticulos(),
    totalAmount: finalAmount.value,
    adelanto: adelanto.value,
    discountCode: discountCode.value,
    discountAmount: discountAmount.value,
    pendingBalance: pendingBalance.value,
    status: pendingBalance.value > 0 ? 'PARTIAL' : 'PENDING',
    paymentMethod: paymentMethod.value,
    createdAt: new Date().toISOString().split('T')[0],
    notes: notes.value
  })
  emit('saved', sale)
}

function close() {
  step.value = 0
  selectedPatient.value = null
  frameOption.value = ''
  lenseMaterial.value = ''
  lenseType.value = ''
  saleDetails.value = [{ productName: '', quantity: 1, unitPrice: 0 }]
  paymentMethod.value = PaymentMethod.CASH
  adelanto.value = 0
  discountCode.value = ''
  discountAmount.value = 0
  notes.value = ''
  emit('close')
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    :style="{ width: '580px' }"
    modal
    :closable="false"
    @update:visible="close"
  >
    <template #header>
      <div class="modal-header">
        <span class="modal-title">Nueva Venta / Cotización</span>
        <span class="step-indicator">Paso {{ step + 1 }} de {{ TOTAL_STEPS }}</span>
      </div>
    </template>

    <div class="modal-body">
      <!-- Step tabs -->
      <div class="step-tabs">
        <div
          v-for="(label, i) in stepLabels"
          :key="i"
          class="step-tab"
          :class="{
            'step-tab--active': i === step,
            'step-tab--done': i < step
          }"
        >
          <span class="step-tab__dot">
            <i v-if="i < step" class="pi pi-check" style="font-size: 0.65rem" />
            <span v-else>{{ i + 1 }}</span>
          </span>
          <span class="step-tab__label">{{ label }}</span>
        </div>
      </div>

      <!-- Step 0: Paciente y Rx -->
      <div v-if="step === 0" class="step-content">
        <div class="form-field">
          <label>Paciente <span class="required">*</span></label>
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
            <span>Última Receta Vinculada</span>
          </div>
          <div class="rx-card__body">
            <div class="rx-row"><span class="rx-eye">OD:</span><span>Esf — / Cil — / Eje —°</span></div>
            <div class="rx-row"><span class="rx-eye">OS:</span><span>Esf — / Cil — / Eje —°</span></div>
            <span class="rx-note">Receta pendiente de vincular con módulo clínico</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Armaz & Lentes -->
      <div v-else-if="step === 1" class="step-content">
        <div class="form-field">
          <label>Armazón <span class="required">*</span></label>
          <pv-select
            v-model="frameOption"
            :options="frameOptions"
            option-label="label"
            option-value="value"
            placeholder="Selecciona armazón..."
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label>Material de Luna</label>
          <pv-select
            v-model="lenseMaterial"
            :options="lenseMaterialOptions"
            option-label="label"
            option-value="value"
            placeholder="Selecciona material..."
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label>Tipo de Luna</label>
          <pv-select
            v-model="lenseType"
            :options="lenseTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Selecciona tipo..."
            class="w-full"
          />
        </div>

        <div class="divider" />

        <p class="section-label">Ítems adicionales</p>
        <div v-for="(detail, i) in saleDetails" :key="i" class="product-row">
          <pv-input-text v-model="detail.productName" placeholder="Accesorio / kit / otro..." class="flex-1" />
          <input
            v-model.number="saleDetails[i].quantity"
            type="number"
            min="1"
            step="1"
            class="qty-input"
            placeholder="Cant."
          />
          <div class="price-input-wrap">
            <span class="price-prefix">S/</span>
            <input
              v-model.number="saleDetails[i].unitPrice"
              type="number"
              min="0"
              step="0.01"
              class="price-input"
              placeholder="0.00"
            />
          </div>
          <pv-button icon="pi pi-trash" severity="danger" text @click="removeDetail(i)" :disabled="saleDetails.length === 1" />
        </div>
        <pv-button label="Agregar ítem" icon="pi pi-plus" text size="small" @click="addDetail" />

        <div class="total-row">
          <span>Subtotal estimado</span>
          <span>S/ {{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Step 2: Pago -->
      <div v-else class="step-content">
        <div class="form-field">
          <label>Método de pago <span class="required">*</span></label>
          <pv-select v-model="paymentMethod" :options="paymentMethodOptions" option-label="label" option-value="value" class="w-full" />
        </div>

        <div class="form-field">
          <label>Adelanto (S/)</label>
          <div class="price-input-wrap">
            <span class="price-prefix">S/</span>
            <input
              v-model.number="adelanto"
              type="number"
              min="0"
              :max="finalAmount"
              step="0.01"
              class="price-input"
              placeholder="0.00"
            />
          </div>
        </div>

        <div class="form-field">
          <label>Código de descuento</label>
          <div class="discount-row">
            <pv-input-text v-model="discountCode" placeholder="ej. DESC15" class="flex-1" />
            <div class="price-input-wrap" style="width: 130px">
              <span class="price-prefix">S/</span>
              <input
                v-model.number="discountAmount"
                type="number"
                min="0"
                :max="totalAmount"
                step="0.01"
                class="price-input"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div class="form-field">
          <label>Notas</label>
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
          <div class="summary-row">
            <span>Adelanto</span>
            <span class="adelanto-val">S/ {{ adelanto.toFixed(2) }}</span>
          </div>
          <div class="summary-row summary-row--total">
            <span>Saldo pendiente</span>
            <span>S/ {{ pendingBalance.toFixed(2) }}</span>
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
            v-if="step < TOTAL_STEPS - 1"
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
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.modal-title {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #101828;
}

.step-indicator {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  color: #6a7282;
  font-weight: 500;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
}

/* Step Tabs */
.step-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 16px;
}

.step-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.step-tab__dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-tab__label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #9ca3af;
}

.step-tab--active .step-tab__dot {
  background: #00c1b0;
  color: #fff;
}

.step-tab--active .step-tab__label {
  color: #101828;
  font-weight: 600;
}

.step-tab--done .step-tab__dot {
  background: #dcfce7;
  color: #008236;
}

.step-tab--done .step-tab__label {
  color: #6a7282;
}

/* Step Content */
.step-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 220px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-field label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #e7000b;
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
  padding: 9px 14px;
  background: #dbeafe;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #1d4ed8;
}

.rx-card__body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rx-row {
  display: flex;
  gap: 8px;
  font-family: 'Consolas', monospace;
  font-size: 0.82rem;
  color: #374151;
}

.rx-eye {
  font-weight: 700;
  color: #1d4ed8;
  width: 24px;
}

.rx-note {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  color: #6b7280;
  margin-top: 4px;
}

.divider {
  border-top: 1px solid #f3f4f6;
}

.section-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6a7282;
  margin: 0;
}

.product-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  padding: 10px 0;
  border-top: 1px solid #e9ecef;
  font-size: 0.9rem;
  color: #101828;
}

.discount-row {
  display: flex;
  gap: 8px;
}

.summary-box {
  background: #f9fafb;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem;
  color: #374151;
}

.summary-row--discount { color: #16a34a; }

.adelanto-val { color: #00a63e; font-weight: 600; }

.summary-row--total {
  font-weight: 700;
  font-size: 0.95rem;
  color: #f54900;
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

.price-input-wrap {
  display: flex;
  align-items: stretch;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.15s;
}

.price-input-wrap:focus-within {
  border-color: #00c1b0;
}

.price-prefix {
  padding: 0 10px;
  font-size: 0.845rem;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border-right: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  user-select: none;
  flex-shrink: 0;
}

.price-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem;
  color: #101828;
  background: transparent;
  min-width: 0;
}

.price-input::-webkit-inner-spin-button,
.price-input::-webkit-outer-spin-button {
  opacity: 0.5;
}

.qty-input {
  width: 72px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem;
  color: #101828;
  outline: none;
  text-align: center;
  transition: border-color 0.15s;
}

.qty-input:focus {
  border-color: #00c1b0;
}

.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
  opacity: 0.5;
}
</style>
