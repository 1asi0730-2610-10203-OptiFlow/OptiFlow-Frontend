<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { WorkOrder } from '../../domain/model/work-order.entity.js'
import { useFulfillmentStore } from '../../application/fulfillment.store.js'
import { useClinicalStore } from '../../../clinical/application/clinical.store.js'
import { useInventoryStore } from '../../../inventory/application/inventory.store.js'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'

const { t } = useI18n()
const emit = defineEmits(['save', 'close'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const fulfillmentStore = useFulfillmentStore()
const clinicalStore = useClinicalStore()
const inventoryStore = useInventoryStore()
const laboratories = computed(() => fulfillmentStore.laboratories)
const patients = computed(() => clinicalStore.patients)
const lensProducts = computed(() => inventoryStore.products.filter(p => p.category === 'Lenses'))
const frameProducts = computed(() => inventoryStore.products.filter(p => p.category === 'Frames'))

const form = ref({
  patientId: null, patientName: '',
  saleId: 0, recipeId: 0,
  labId: 0, laboratoryName: '',
  lensType: '', lensProductId: '',
  odSphere: '', odCylinder: '', odAxis: '',
  osSphere: '', osCylinder: '', osAxis: '',
  frame: '', frameProductId: '', orderDate: new Date().toISOString().split('T')[0],
  deliveryDate: '', priority: 'normal',
  deposit: '', total: ''
})

function onLensChange() {
  const product = lensProducts.value.find(p => p.id === form.value.lensProductId)
  form.value.lensType = product ? product.name : ''
}

function onFrameChange() {
  const product = frameProducts.value.find(p => p.id === form.value.frameProductId)
  form.value.frame = product ? product.name : ''
}

function onPatientChange() {
  const patient = patients.value.find(p => p.id === form.value.patientId)
  if (!patient) { form.value.patientName = ''; form.value.recipeId = 0; return }
  form.value.patientName = `${patient.firstName} ${patient.lastName}`
  // saleId stays 0 here — the sale for this order doesn't exist yet. It gets
  // linked back to this work order once a sale is created for it (see
  // sale-list.vue's onSaleCreated -> workOrderApi.linkSale).
  const record = clinicalStore.getRecordForPatient(patient.id)
  if (record) {
    const rxs = clinicalStore.getPrescriptionsForRecord(record.id)
    form.value.recipeId = rxs.length > 0 ? rxs[rxs.length - 1].id : 0
  } else {
    form.value.recipeId = 0
  }
}

function onLabChange() {
  const lab = laboratories.value.find(l => l.id === form.value.labId)
  form.value.laboratoryName = lab ? lab.name : ''
}

const totalNum = computed(() => parseFloat(form.value.total) || 0)
const depositNum = computed(() => parseFloat(form.value.deposit) || 0)
const pendingBalance = computed(() => Math.max(0, totalNum.value - depositNum.value))

const todayStr = new Date().toISOString().split('T')[0]
// Delivery cannot be before the order date, and never in the past.
const minDeliveryDate = computed(() => {
  const od = form.value.orderDate
  return od && od > todayStr ? od : todayStr
})

function buildPrescription() {
  const od = form.value.odSphere
      ? `OD: Esf ${form.value.odSphere}${form.value.odCylinder ? `, Cil ${form.value.odCylinder}` : ''}${form.value.odAxis ? `, Eje ${form.value.odAxis}` : ''}`
      : ''
  const os = form.value.osSphere
      ? `OS: Esf ${form.value.osSphere}${form.value.osCylinder ? `, Cil ${form.value.osCylinder}` : ''}${form.value.osAxis ? `, Eje ${form.value.osAxis}` : ''}`
      : ''
  return [od, os].filter(Boolean).join(' | ') || t('labOrders.newOrderModal.noPrescription')
}

const errors = ref({})
const submitted = ref(false)

function validate() {
  const e = {}
  if (!form.value.patientId) e.patientName = true
  if (!form.value.deliveryDate) e.deliveryDate = true
  else if (form.value.deliveryDate < minDeliveryDate.value) e.deliveryDateInvalid = true
  if (!form.value.labId) e.labId = true
  if (!form.value.total || totalNum.value <= 0) e.total = true
  else if (totalNum.value > 1000000) e.totalRange = true
  if (depositNum.value < 0 || depositNum.value > 1000000) e.depositRange = true
  else if (depositNum.value > totalNum.value) e.deposit = true
  errors.value = e
  return Object.keys(e).length === 0
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function onSubmit() {
  submitted.value = true
  if (!validate()) return
  const workOrder = new WorkOrder({
    id: 0,
    saleId: form.value.saleId,
    recipeId: form.value.recipeId,
    labId: form.value.labId,
    status: 'PENDING',
    deliveryDate:   form.value.deliveryDate,
    patientName:    form.value.patientName,
    laboratoryName: form.value.laboratoryName,
    lensType:       form.value.lensType,
    lensProductId:  form.value.lensProductId || null,
    frame:          form.value.frame || t('labOrders.newOrderModal.noFrame'),
    frameProductId: form.value.frameProductId || null,
    prescription:   buildPrescription(),
    priority:       form.value.priority,
    deposit:        depositNum.value,
    total:          totalNum.value,
    isRework:       false
  })
  emit('save', workOrder)
}
</script>

<template>
  <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div>
          <h3 class="modal-title">{{ $t('labOrders.newOrderModal.title') }}</h3>
          <p class="modal-subtitle">{{ $t('labOrders.newOrderModal.subtitle') }}</p>
        </div>
        <button class="close-btn" @click="requestClose">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Patient and Laboratory -->
        <div class="form-row">
          <div class="field">
            <label>{{ $t('labOrders.newOrderModal.patient') }} *</label>
            <select
              v-model="form.patientId"
              class="form-select"
              :class="{ 'form-select--error': errors.patientName }"
              @change="onPatientChange(); errors.patientName = false"
            >
              <option :value="null">{{ $t('labOrders.newOrderModal.selectPatient') }}</option>
              <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                {{ patient.firstName }} {{ patient.lastName }}
              </option>
            </select>
            <span v-if="errors.patientName" class="field-error">{{ $t('common.fieldRequired') }}</span>
          </div>
          <div class="field">
            <label>{{ $t('labOrders.newOrderModal.laboratory') }} *</label>
            <select
              v-model="form.labId"
              class="form-select"
              :class="{ 'form-select--error': errors.labId }"
              @change="onLabChange(); errors.labId = false"
            >
              <option :value="0">{{ $t('labOrders.newOrderModal.selectPatient') }}</option>
              <option v-for="lab in laboratories" :key="lab.id" :value="lab.id">
                {{ lab.name }}
              </option>
            </select>
            <span v-if="errors.labId" class="field-error">{{ $t('common.fieldRequired') }}</span>
          </div>
        </div>

        <!-- Lens type and Priority -->
        <div class="form-row">
          <div class="field">
            <label>{{ $t('labOrders.newOrderModal.lensType') }}</label>
            <select v-model="form.lensProductId" class="form-select" @change="onLensChange">
              <option value="">{{ $t('labOrders.newOrderModal.selectLensType') }}</option>
              <option v-for="product in lensProducts" :key="product.id" :value="product.id">{{ product.name }}</option>
            </select>
            <span v-if="lensProducts.length === 0" class="field-hint">
              {{ $t('labOrders.newOrderModal.noLensProducts') }}
            </span>
          </div>
          <div class="field">
            <label>{{ $t('labOrders.newOrderModal.priority') }}</label>
            <select v-model="form.priority" class="form-select">
              <option value="normal">{{ $t('labOrders.priority.normal') }}</option>
              <option value="high">{{ $t('labOrders.priority.high') }}</option>
              <option value="urgent">{{ $t('labOrders.priority.urgent') }}</option>
            </select>
          </div>
        </div>

        <!-- Prescription -->
        <div class="recipe-section">
          <label class="recipe-label">
            <i class="pi pi-eye" style="color: #00c1b0" />
            {{ $t('labOrders.newOrderModal.opticalPrescription') }}
          </label>
          <div class="recipe-grid-wrapper">
            <div class="recipe-header-row">
              <span class="recipe-col-label">{{ $t('labOrders.newOrderModal.eye') }}</span>
              <span class="recipe-col-label">{{ $t('labOrders.newOrderModal.sphere') }}</span>
              <span class="recipe-col-label">{{ $t('labOrders.newOrderModal.cylinder') }}</span>
              <span class="recipe-col-label">{{ $t('labOrders.newOrderModal.axis') }}</span>
            </div>
            <div class="recipe-data-row">
              <span class="eye-label">{{ $t('labOrders.newOrderModal.rightEye') }}</span>
              <input v-model="form.odSphere"   class="recipe-input" :placeholder="$t('labOrders.newOrderModal.spherePlaceholder')" />
              <input v-model="form.odCylinder" class="recipe-input" :placeholder="$t('labOrders.newOrderModal.cylinderPlaceholder')" />
              <input v-model="form.odAxis"     class="recipe-input" :placeholder="$t('labOrders.newOrderModal.axisPlaceholder')" />
            </div>
            <div class="recipe-data-row">
              <span class="eye-label">{{ $t('labOrders.newOrderModal.leftEye') }}</span>
              <input v-model="form.osSphere"   class="recipe-input" :placeholder="$t('labOrders.newOrderModal.spherePlaceholder')" />
              <input v-model="form.osCylinder" class="recipe-input" :placeholder="$t('labOrders.newOrderModal.cylinderPlaceholder')" />
              <input v-model="form.osAxis"     class="recipe-input" :placeholder="$t('labOrders.newOrderModal.axisPlaceholder')" />
            </div>
          </div>
        </div>

        <!-- Frame and Dates -->
        <div class="form-row form-row--3">
          <div class="field">
            <label>{{ $t('labOrders.newOrderModal.frame') }}</label>
            <select v-model="form.frameProductId" class="form-select" @change="onFrameChange">
              <option value="">{{ $t('labOrders.newOrderModal.selectFrame') }}</option>
              <option v-for="product in frameProducts" :key="product.id" :value="product.id">{{ product.name }}</option>
            </select>
            <span v-if="frameProducts.length === 0" class="field-hint">
              {{ $t('labOrders.newOrderModal.noFrameProducts') }}
            </span>
          </div>
          <div class="field">
            <label>{{ $t('labOrders.newOrderModal.orderDate') }}</label>
            <input v-model="form.orderDate" type="date" class="form-input" :max="todayStr" />
          </div>
          <div class="field">
            <label>{{ $t('labOrders.newOrderModal.deliveryDate') }} *</label>
            <input
              v-model="form.deliveryDate"
              type="date"
              class="form-input"
              :class="{ 'form-input--error': errors.deliveryDate || errors.deliveryDateInvalid }"
              :min="minDeliveryDate"
              @input="errors.deliveryDate = false; errors.deliveryDateInvalid = false"
            />
            <span v-if="errors.deliveryDateInvalid" class="field-error">
              {{ $t('labOrders.newOrderModal.deliveryDateError') }}
            </span>
          </div>
        </div>

        <!-- Totals -->
        <div class="form-row">
          <div class="field">
            <label>{{ $t('labOrders.newOrderModal.totalAmount') }} *</label>
            <input
              v-model="form.total"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              class="form-input"
              :class="{ 'form-input--error': errors.total || errors.totalRange }"
              :placeholder="$t('labOrders.newOrderModal.amountPlaceholder')"
              @input="errors.total = false; errors.totalRange = false"
            />
            <span v-if="errors.total" class="field-error">
              {{ $t('common.fieldRequired') }}
            </span>
            <span v-else-if="errors.totalRange" class="field-error">
              {{ $t('labOrders.newOrderModal.amountRange') }}
            </span>
          </div>
          <div class="field">
            <label>{{ $t('labOrders.newOrderModal.deposit') }}</label>
            <input
              v-model="form.deposit"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              class="form-input"
              :class="{ 'form-input--error': errors.deposit || errors.depositRange }"
              :placeholder="$t('labOrders.newOrderModal.amountPlaceholder')"
              @input="errors.deposit = false; errors.depositRange = false"
            />
            <span v-if="errors.depositRange" class="field-error">
              {{ $t('labOrders.newOrderModal.amountRange') }}
            </span>
            <span v-else-if="errors.deposit" class="field-error">
              {{ $t('labOrders.newOrderModal.depositError') }}
            </span>
          </div>
        </div>

        <!-- Pending balance preview -->
        <div v-if="totalNum > 0" class="saldo-preview">
          <span class="saldo-preview-label">{{ $t('labOrders.newOrderModal.pendingAfterDeposit') }}</span>
          <span class="saldo-preview-value" :class="pendingBalance > 0 ? 'saldo--orange' : 'saldo--green'">
            S/ {{ pendingBalance.toFixed(2) }}
          </span>
        </div>

        <p v-if="submitted && hasErrors" style="color: #dc2626; font-size: 0.8rem; font-family: Montserrat; margin: 0;">
          {{ $t('common.requiredError') }}
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="requestClose">{{ $t('common.cancel') }}</button>
        <button class="btn-save" @click="onSubmit">{{ $t('labOrders.newOrderModal.createOrder') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.15rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 1; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-row--3 { grid-template-columns: 1fr 1fr 1fr; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.form-select, .form-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; outline: none; background: #fff; transition: border-color 0.15s; }
.form-select:focus, .form-input:focus { border-color: #00c1b0; }
.form-input--error, .form-select--error { border-color: #f87171 !important; background-color: #fff5f5 !important; }
.field-hint { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #9ca3af; margin-top: 1px; }
.field-error { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #dc2626; margin-top: 2px; }
.recipe-section { display: flex; flex-direction: column; gap: 8px; }
.recipe-label { display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 700; color: #374151; }
.recipe-grid-wrapper { background: rgba(150,246,238,0.2); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.recipe-header-row, .recipe-data-row { display: grid; grid-template-columns: 80px 1fr 1fr 1fr; gap: 8px; align-items: center; }
.recipe-col-label { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 700; color: #00c1b0; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; }
.recipe-col-label:first-child { text-align: left; }
.eye-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.recipe-input { padding: 6px 8px; border: 1px solid #fff; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.82rem; text-align: center; background: #fff; outline: none; transition: border-color 0.15s; }
.recipe-input:focus { border-color: #00c1b0; }
.saldo-preview { background: #f9fafb; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
.saldo-preview-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.saldo-preview-value { font-family: 'Montserrat', sans-serif; font-size: 0.88rem; font-weight: 700; }
.saldo--orange { color: #ea580c; }
.saldo--green  { color: #16a34a; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #f3f4f6; flex-shrink: 0; }
.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-save { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-save:hover { opacity: 0.9; }
</style>