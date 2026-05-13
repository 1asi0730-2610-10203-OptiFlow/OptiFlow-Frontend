<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sale } from '../../../sales/domain/model/sale.entity.js'
import { PaymentMethod } from '../../../sales/domain/model/payment.entity.js'
import axios from 'axios'

defineProps({
  visible: { type: Boolean, required: true }
})

const emit = defineEmits(['saved', 'close'])

const { t } = useI18n()

const step = ref(0)
const TOTAL_STEPS = 3
const stepLabels = computed(() => [
  t('sales.form.steps.patient'),
  t('sales.form.steps.products'),
  t('sales.form.steps.payment')
])

// Step 0
const patients = ref([])
const selectedPatient = ref(null)

// Step 1 — products from API + manual extras
const products = ref([])
const selectedArmazon = ref(null)
const tipoLuna = ref(null)
const materialLuna = ref(null)

const tipoLunaOptions = computed(() => [
  { label: t('sales.form.lensTypes.monofocal'), value: 'Monofocales' },
  { label: t('sales.form.lensTypes.bifocal'), value: 'Bifocales' },
  { label: t('sales.form.lensTypes.progressive'), value: 'Progresivas' },
  { label: t('sales.form.lensTypes.occupational'), value: 'Ocupacionales' }
])

const materialLunaOptions = computed(() => [
  { label: t('sales.form.materials.cr39'), value: 'Resina 1.50' },
  { label: t('sales.form.materials.poly'), value: 'Policarbonato' },
  { label: t('sales.form.materials.hi160'), value: 'Alto Índice 1.60' },
  { label: t('sales.form.materials.hi167'), value: 'Alto Índice 1.67' },
  { label: t('sales.form.materials.glass'), value: 'Cristal' }
])

// Step 2 — pricing
const totalAmountInput = ref(0)
const adelanto = ref(0)
const discountCode = ref('')
const discountAmount = ref(0)
const paymentMethod = ref(PaymentMethod.CASH)
const notes = ref('')

const paymentMethodOptions = computed(() => [
  { label: t('sales.form.paymentMethods.cash'),           value: PaymentMethod.CASH },
  { label: t('sales.form.paymentMethods.credit'), value: PaymentMethod.CREDIT_CARD },
  { label: t('sales.form.paymentMethods.debit'),  value: PaymentMethod.DEBIT_CARD },
  { label: t('sales.form.paymentMethods.transfer'),      value: PaymentMethod.TRANSFER },
  { label: t('sales.form.paymentMethods.insurance'),             value: PaymentMethod.INSURANCE }
])

const estimatedTotal = computed(() => {
  let total = 0
  if (selectedArmazon.value && typeof selectedArmazon.value === 'object' && selectedArmazon.value.price) {
    total += Number(selectedArmazon.value.price)
  }
  return total > 0 ? total : totalAmountInput.value
})

const finalAmount = computed(() =>
  Math.max(0, estimatedTotal.value - (discountAmount.value || 0))
)

const pendingBalance = computed(() =>
  Math.max(0, finalAmount.value - (adelanto.value || 0))
)

const adelantoPercent = computed(() => {
  if (finalAmount.value === 0) return 0
  return Math.round(((adelanto.value || 0) / finalAmount.value) * 100)
})

const canSave = computed(() =>
  !!selectedPatient.value && finalAmount.value > 0
)

function applyDiscount() {
  if (discountCode.value.toUpperCase() === 'PROMO15') {
    discountAmount.value = estimatedTotal.value * 0.15
  } else {
    discountAmount.value = 0
  }
}

onMounted(async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_OPTIFLOW_API_URL}/patients`)
    patients.value = res.data
  } catch (e) {
    console.error('Error loading patients:', e)
  }
  try {
    const res = await axios.get(`${import.meta.env.VITE_OPTIFLOW_API_URL}${import.meta.env.VITE_PRODUCTS_ENDPOINT_PATH}`)
    products.value = res.data
  } catch (e) {
    console.error('Error loading products:', e)
  }
})

function nextStep() {
  if (step.value < TOTAL_STEPS - 1) step.value++
}
function prevStep() {
  if (step.value > 0) step.value--
}

function buildArticulos() {
  const arts = []
  if (selectedArmazon.value) {
    const name = typeof selectedArmazon.value === 'string' ? selectedArmazon.value : selectedArmazon.value.name
    arts.push(`Armazón: ${name}`)
  }
  if (tipoLuna.value) {
    arts.push(`Tipo de Luna: ${tipoLuna.value}`)
  }
  if (materialLuna.value) {
    arts.push(`Material de Luna: ${materialLuna.value}`)
  }
  return arts
}

function generateCode(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

function save() {
  if (!canSave.value) return
  const sale = new Sale({
    invoiceNumber: generateCode('FAC'),
    labOrderNumber: generateCode('LAB'),
    patientId: selectedPatient.value.id,
    patientName: selectedPatient.value.name,
    patientRx: selectedPatient.value.rx ?? '',
    userId: 1,
    userName: 'John Doe',
    articulos: buildArticulos(),
    totalAmount: finalAmount.value,
    adelanto: adelanto.value || 0,
    discountCode: discountCode.value,
    discountAmount: discountAmount.value || 0,
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
  selectedArmazon.value = null
  tipoLuna.value = null
  materialLuna.value = null
  totalAmountInput.value = 0
  adelanto.value = 0
  discountCode.value = ''
  discountAmount.value = 0
  paymentMethod.value = PaymentMethod.CASH
  notes.value = ''
  emit('close')
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    :style="{ width: 'min(580px, 95vw)' }"
    modal
    :closable="false"
    @update:visible="close"
  >
    <template #header>
      <div class="modal-header">
        <span class="modal-title">{{ $t('sales.form.title') }}</span>
        <span class="step-indicator">{{ $t('sales.form.step') }} {{ step + 1 }} {{ $t('sales.form.of') }} {{ TOTAL_STEPS }}</span>
      </div>
    </template>

    <div class="modal-body">
      <!-- Step tabs -->
      <div class="step-tabs">
        <div
          v-for="(label, i) in stepLabels"
          :key="i"
          class="step-tab"
          :class="{ 'step-tab--active': i === step, 'step-tab--done': i < step }"
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
          <label>{{ $t('sales.form.patientLabel') }} <span class="required">*</span></label>
          <pv-select
            v-model="selectedPatient"
            :options="patients"
            option-label="name"
            :placeholder="$t('sales.form.selectPatient')"
            class="w-full"
            filter
          />
        </div>

        <div v-if="selectedPatient" class="rx-card">
          <div class="rx-card__header">
            <i class="pi pi-file-edit"/>
            <span>{{ $t('sales.form.lastRx') }}</span>
          </div>
          <div class="rx-card__body">
            <div class="rx-row"><span class="rx-eye">OD:</span><span>Esf — / Cil — / Eje —°</span></div>
            <div class="rx-row"><span class="rx-eye">OS:</span><span>Esf — / Cil — / Eje —°</span></div>
            <span class="rx-note">{{ $t('sales.form.rxPending') }}</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Productos -->
      <div v-else-if="step === 1" class="step-content">
        <div class="form-field">
          <label>{{ $t('sales.form.frame') }} <span class="required">*</span></label>
          <pv-select
            v-model="selectedArmazon"
            :options="products"
            option-label="name"
            editable
            :placeholder="$t('sales.form.framePlaceholder')"
            class="w-full"
            filter
          />
        </div>

        <div class="form-field">
          <label>{{ $t('sales.form.lensType') }}</label>
          <pv-select
            v-model="tipoLuna"
            :options="tipoLunaOptions"
            option-label="label"
            option-value="value"
            :placeholder="$t('sales.form.select')"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label>{{ $t('sales.form.lensMaterial') }}</label>
          <pv-select
            v-model="materialLuna"
            :options="materialLunaOptions"
            option-label="label"
            option-value="value"
            :placeholder="$t('sales.form.select')"
            class="w-full"
          />
        </div>

        <div class="estimated-total-box">
          <span class="estimated-label">{{ $t('sales.form.estimatedTotal') }}</span>
          <span class="estimated-value">S/ {{ estimatedTotal.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Step 2: Pago -->
      <div v-else class="step-content">
        <div class="form-field">
          <label>{{ $t('sales.form.paymentMethod') }}</label>
          <pv-select
            v-model="paymentMethod"
            :options="paymentMethodOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label><i class="pi pi-tag" style="font-size: 0.8rem; margin-right: 4px;" /> {{ $t('sales.form.discountCode') }}</label>
          <div class="discount-row">
            <pv-input-text v-model="discountCode" :placeholder="$t('sales.form.discountPlaceholder')" class="flex-1" />
            <pv-button :label="$t('sales.form.apply')" outlined @click="applyDiscount" />
          </div>
        </div>

        <div class="form-field">
          <label>{{ $t('sales.form.deposit') }} <span class="required">*</span></label>
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

        <div class="summary-box">
          <div class="summary-row">
            <span>{{ $t('sales.form.subtotal') }}</span>
            <span style="font-weight: 600">S/ {{ estimatedTotal.toFixed(2) }}</span>
          </div>
          <div v-if="(discountAmount || 0) > 0" class="summary-row summary-row--discount">
            <span>{{ $t('sales.form.discount') }}</span>
            <span>- S/ {{ (discountAmount || 0).toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>{{ $t('sales.form.total') }}</span>
            <span style="font-weight: 700">S/ {{ finalAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-row summary-row--discount">
            <span>{{ $t('sales.form.depositPercent', { percent: adelantoPercent }) }}</span>
            <span>- S/ {{ (adelanto || 0).toFixed(2) }}</span>
          </div>
          <div class="summary-row summary-row--total">
            <span>{{ $t('sales.form.pendingBalance') }}</span>
            <span>S/ {{ pendingBalance.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <pv-button
          v-if="step > 0"
          :label="$t('sales.form.back')"
          outlined
          severity="secondary"
          @click="prevStep"
        />
        <pv-button
          v-else
          :label="$t('sales.form.cancel')"
          outlined
          severity="secondary"
          @click="close"
        />
        
        <div class="footer-nav">
          <pv-button
            v-if="step < TOTAL_STEPS - 1"
            :label="$t('sales.form.next')"
            icon="pi pi-chevron-right"
            icon-pos="right"
            :disabled="step === 0 && !selectedPatient"
            @click="nextStep"
          />
          <pv-button
            v-else
            :label="$t('sales.form.create')"
            icon="pi pi-chevron-right"
            icon-pos="right"
            :disabled="!canSave"
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

.step-tabs {
  display: flex;
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

.step-tab--active .step-tab__dot { background: #00c1b0; color: #fff; }
.step-tab--active .step-tab__label { color: #101828; font-weight: 600; }
.step-tab--done .step-tab__dot { background: #dcfce7; color: #008236; }
.step-tab--done .step-tab__label { color: #6a7282; }

.step-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 240px;
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

.required { color: #e7000b; }

.field-hint {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  color: #e7000b;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.rx-eye { font-weight: 700; color: #1d4ed8; width: 24px; }

.rx-note {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  color: #6b7280;
  margin-top: 4px;
}

.divider { border-top: 1px solid #f3f4f6; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6a7282;
  margin: 0;
}

.add-link {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #00c1b0;
  cursor: pointer;
}

.add-product-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-product-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  background: #00c1b0;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.add-product-btn:disabled {
  background: #d1d5db;
  cursor: default;
}

.selected-products-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selected-product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 8px 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  color: #14532d;
}

.extra-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-btn {
  background: none;
  border: none;
  padding: 4px 6px;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s;
}

.remove-btn:hover { color: #e7000b; }

.estimated-total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 10px;
}

.estimated-label {
  color: #6c757d;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
}

.estimated-value {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #101828;
}

.discount-row { display: flex; gap: 8px; }

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
  color: #374151;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}
.summary-row--total span:last-child {
  color: #f54900;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-nav { display: flex; gap: 8px; }

.price-input-wrap {
  display: flex;
  align-items: stretch;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.15s;
}

.price-input-wrap:focus-within { border-color: #00c1b0; }
.price-input-wrap--error { border-color: #fca5a5; background: #fff5f5; }

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
  padding: 9px 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  color: #101828;
  background: transparent;
  min-width: 0;
}

.price-input::-webkit-inner-spin-button,
.price-input::-webkit-outer-spin-button { opacity: 0.5; }

@media (max-width: 500px) {
  .two-col {
    grid-template-columns: 1fr;
  }

  .step-tab__label {
    display: none;
  }
}
</style>
