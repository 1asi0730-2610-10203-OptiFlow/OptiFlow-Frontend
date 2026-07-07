<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sale } from '../../../sales/domain/model/sale.entity.js'
import { PaymentMethod } from '../../../sales/domain/model/payment.entity.js'
import { WorkOrderApi } from '../../../fulfillment/infrastructure/work-order-api.js'
import { WorkOrderAssembler } from '../../../fulfillment/infrastructure/work-order.assembler.js'
import { OrderStatus } from '../../../fulfillment/domain/model/work-order.entity.js'
import { PatientApi } from '../../../clinical/infrastructure/patient-api.js'
import { PatientAssembler } from '../../../clinical/infrastructure/patient.assembler.js'
import { useInventoryStore } from '../../../inventory/application/inventory.store.js'

const workOrderApi = new WorkOrderApi()
const patientApi = new PatientApi()
const inventoryStore = useInventoryStore()

const props = defineProps({
  visible: { type: Boolean, required: true }
})

const emit = defineEmits(['saved', 'close'])

const { t } = useI18n()

const step = ref(0)
const TOTAL_STEPS = 2
const stepLabels = computed(() => [
  t('sales.form.steps.order'),
  t('sales.form.steps.payment')
])

// Step 0 — select existing order
const orders = ref([])
const selectedOrder = ref(null)
const orderSearch = ref('')
const patients = ref([])
const showValidationErrors = ref(false)

// Step 0 — products sold as part of this sale
const items = ref([])

const itemsValid = computed(() =>
  items.value.length > 0 && items.value.every(i => i.productId && i.quantity > 0 && i.quantity <= 1000000)
)

function prefillItemsFromOrder(order) {
  items.value = [order.frameProductId, order.lensProductId]
    .filter(id => id !== null && id !== undefined && id !== '')
    .map(productId => ({ productId, quantity: 1 }))
}

function selectOrder(order) {
  selectedOrder.value = order
  prefillItemsFromOrder(order)
}

const missingLinkedProducts = computed(() => {
  const order = selectedOrder.value
  if (!order) return []
  const missing = []
  if (order.frame && !order.frameProductId) missing.push(order.frame)
  if (order.lensType && !order.lensProductId) missing.push(order.lensType)
  return missing
})

function addItemRow() {
  items.value.push({ productId: null, quantity: 1 })
}

function removeItemRow(index) {
  items.value.splice(index, 1)
}

// Step 1 — payment
const adelanto = ref(0)
const discountCode = ref('')
const discountAmount = ref(0)
const paymentMethod = ref(PaymentMethod.CASH)
const notes = ref('')

const paymentMethodOptions = computed(() => [
  { label: t('sales.form.paymentMethods.cash'),     value: PaymentMethod.CASH },
  { label: t('sales.form.paymentMethods.credit'),   value: PaymentMethod.CREDIT_CARD },
  { label: t('sales.form.paymentMethods.debit'),    value: PaymentMethod.DEBIT_CARD },
  { label: t('sales.form.paymentMethods.transfer'), value: PaymentMethod.TRANSFER },
  { label: t('sales.form.paymentMethods.insurance'),value: PaymentMethod.INSURANCE }
])

const sellableOrders = computed(() =>
  orders.value.filter(o => o.status !== OrderStatus.DELIVERED && !o.saleId)
)

const filteredOrders = computed(() => {
  if (!orderSearch.value) return sellableOrders.value
  const q = orderSearch.value.toLowerCase()
  return sellableOrders.value.filter(o =>
    (o.patientName || '').toLowerCase().includes(q) ||
    (o.frame || '').toLowerCase().includes(q) ||
    (o.lensType || '').toLowerCase().includes(q) ||
    String(o.id).includes(q)
  )
})

const estimatedTotal = computed(() => selectedOrder.value?.total ?? 0)

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

const canSave = computed(() => !!selectedOrder.value && itemsValid.value && finalAmount.value > 0)

function applyDiscount() {
  if (discountCode.value.toUpperCase() === 'PROMO15') {
    discountAmount.value = estimatedTotal.value * 0.15
  } else {
    discountAmount.value = 0
  }
}

async function loadOrders() {
  try {
    const resources = await workOrderApi.getWorkOrders()
    orders.value = WorkOrderAssembler.toEntitiesFromResponse(resources)
  } catch (e) {
    console.error('Error loading orders:', e)
  }
}

onMounted(async () => {
  await loadOrders()
  try {
    const resources = await patientApi.getPatients()
    patients.value = PatientAssembler.toEntitiesFromResponse(resources)
  } catch (e) {
    console.error('Error loading patients:', e)
  }
  if (inventoryStore.products.length === 0) {
    await inventoryStore.loadProducts()
  }
})

// Re-fetch orders each time the modal opens, so an order that just got a sale
// (created in a previous open of this same modal instance) drops out of the list.
watch(() => props.visible, (visible) => {
  if (visible) loadOrders()
})

function nextStep() {
  if (step.value === 0 && (!selectedOrder.value || !itemsValid.value)) {
    showValidationErrors.value = true
    return
  }
  showValidationErrors.value = false
  if (step.value < TOTAL_STEPS - 1) step.value++
}

function prevStep() {
  showValidationErrors.value = false
  if (step.value > 0) step.value--
}

function generateCode(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

function save() {
  if (adelanto.value < finalAmount.value * 0.3) {
    showValidationErrors.value = true
    return
  }
  if (!canSave.value) return

  const order = selectedOrder.value
  const matchedPatient = patients.value.find(p =>
    `${p.firstName || ''} ${p.lastName || ''}`.trim().toLowerCase() === (order.patientName || '').toLowerCase()
  )

  const sale = new Sale({
    invoiceNumber: generateCode('FAC'),
    labOrderNumber: `WO-${order.id}`,
    patientId: matchedPatient?.id ?? 0,
    patientName: order.patientName || '',
    patientRx: '',
    userId: 1,
    userName: 'John Doe',
    items: items.value.map(i => ({ productId: i.productId, quantity: i.quantity })),
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
  emit('saved', sale, order.id)
}

function close() {
  step.value = 0
  selectedOrder.value = null
  orderSearch.value = ''
  items.value = []
  adelanto.value = 0
  discountCode.value = ''
  discountAmount.value = 0
  paymentMethod.value = PaymentMethod.CASH
  notes.value = ''
  showValidationErrors.value = false
  emit('close')
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    :style="{ width: 'min(600px, 95vw)' }"
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

      <!-- Step 0: Select existing order -->
      <div v-if="step === 0" class="step-content">
        <div class="form-field">
          <label>{{ $t('sales.form.selectOrderLabel') }} <span class="required">*</span></label>
          <div class="search-wrap">
            <i class="pi pi-search search-icon" />
            <input
              v-model="orderSearch"
              class="search-input"
              :placeholder="$t('sales.form.orderSearchPlaceholder')"
            />
          </div>
          <span v-if="showValidationErrors && !selectedOrder" class="field-hint">{{ $t('sales.form.requiredError') }}</span>
        </div>

        <div v-if="filteredOrders.length === 0" class="empty-orders">
          <i class="pi pi-inbox" />
          <span>{{ $t('sales.form.noOrders') }}</span>
        </div>

        <div class="orders-list">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
            :class="{ 'order-card--selected': selectedOrder?.id === order.id }"
            @click="selectOrder(order)"
          >
            <div class="order-card__check">
              <i v-if="selectedOrder?.id === order.id" class="pi pi-check-circle" style="color: #00c1b0;" />
              <i v-else class="pi pi-circle" style="color: #d1d5db;" />
            </div>
            <div class="order-card__body">
              <div class="order-card__top">
                <span class="order-card__patient">{{ order.patientName }}</span>
                <span class="order-card__id">#{{ order.id }}</span>
              </div>
              <div class="order-card__detail">
                <span v-if="order.frame">{{ order.frame }}</span>
                <span v-if="order.frame && order.lensType"> · </span>
                <span v-if="order.lensType">{{ order.lensType }}</span>
              </div>
            </div>
            <div class="order-card__total">S/ {{ Number(order.total).toFixed(2) }}</div>
          </div>
        </div>

        <div v-if="selectedOrder" class="selected-order-preview">
          <i class="pi pi-info-circle" style="color: #00c1b0; flex-shrink: 0;" />
          <span>{{ $t('sales.form.orderSelected') }}: <strong>{{ selectedOrder.patientName }}</strong> — S/ {{ Number(selectedOrder.total).toFixed(2) }}</span>
        </div>

        <div v-if="missingLinkedProducts.length" class="missing-products-warning">
          <i class="pi pi-exclamation-triangle" />
          <span>{{ $t('sales.form.missingProductWarning', { items: missingLinkedProducts.join(', ') }) }}</span>
        </div>

        <div v-if="selectedOrder" class="form-field">
          <label>{{ $t('sales.form.itemsLabel') }} <span class="required">*</span></label>
          <div class="items-list">
            <div v-for="(item, index) in items" :key="index" class="item-row">
              <select v-model="item.productId" class="item-select">
                <option :value="null">{{ $t('sales.form.product') }}</option>
                <option v-for="product in inventoryStore.products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </select>
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                max="1000000"
                class="item-qty"
                :placeholder="$t('sales.form.quantity')"
              />
              <button type="button" class="item-remove" @click="removeItemRow(index)">
                <i class="pi pi-trash" />
              </button>
            </div>
          </div>
          <button type="button" class="add-item-btn" @click="addItemRow">
            <i class="pi pi-plus" /> {{ $t('sales.form.addItem') }}
          </button>
          <span v-if="showValidationErrors && !itemsValid" class="field-hint">{{ $t('sales.form.itemsRequiredError') }}</span>
        </div>
      </div>

      <!-- Step 1: Pago -->
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
          <div class="price-input-wrap" :class="{ 'price-input-wrap--error': showValidationErrors && adelanto < finalAmount * 0.3 }">
            <span class="price-prefix">S/</span>
            <input
              v-model.number="adelanto"
              type="number"
              min="0"
              :max="finalAmount"
              step="0.01"
              class="price-input"
              placeholder="0.00"
              @input="showValidationErrors = false"
            />
          </div>
          <span v-if="showValidationErrors && adelanto < finalAmount * 0.3" class="field-hint">{{ $t('sales.form.requiredError') }} (Min. 30%)</span>
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
            @click="nextStep"
          />
          <pv-button
            v-else
            :label="$t('sales.form.create')"
            icon="pi pi-chevron-right"
            icon-pos="right"
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

/* ── Order selection (step 0) ── */
.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.85rem;
}

.search-input {
  width: 100%;
  padding: 9px 12px 9px 34px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus { border-color: #00c1b0; }

.empty-orders {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #9ca3af;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  justify-content: center;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 2px;
}

.order-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.order-card:hover { border-color: #a7f3ed; background: #f0fdfb; }

.order-card--selected {
  border-color: #00c1b0;
  background: rgba(0, 193, 176, 0.04);
}

.order-card__check { flex-shrink: 0; font-size: 1.1rem; }

.order-card__body { flex: 1; min-width: 0; }

.order-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.order-card__patient {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-card__id {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  color: #9ca3af;
  flex-shrink: 0;
}

.order-card__detail {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-card__total {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: #111827;
  flex-shrink: 0;
}

.selected-order-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  color: #166534;
}

.missing-products-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  color: #9a3412;
}

.discount-row { display: flex; gap: 8px; }

/* ── Sale items (products + quantities) ── */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.item-select {
  flex: 1;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem;
  color: #101828;
  background: #fff;
  outline: none;
}

.item-select:focus { border-color: #00c1b0; }

.item-qty {
  width: 72px;
  padding: 9px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.845rem;
  color: #101828;
  outline: none;
  text-align: center;
}

.item-qty:focus { border-color: #00c1b0; }

.item-remove {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  background: #fff;
  color: #e7000b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-remove:hover { background: #fff5f5; }

.add-item-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  margin-top: 4px;
  padding: 7px 12px;
  border: 1px dashed #00c1b0;
  border-radius: 8px;
  background: none;
  color: #00c1b0;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.add-item-btn:hover { background: #f0fdfb; }

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
