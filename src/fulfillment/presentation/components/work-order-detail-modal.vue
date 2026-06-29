<script setup>
import { useI18n } from 'vue-i18n'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'

const { t } = useI18n()

const props = defineProps({
  workOrder: { type: Object, required: true }
})
const emit = defineEmits(['close', 'statusChanged'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const ORDER_FLOW = ['PENDING', 'IN_PRODUCTION', 'QUALITY_CONTROL', 'READY', 'DELIVERED']

const progressColumns = [
  { key: 'PENDING' },
  { key: 'IN_PRODUCTION' },
  { key: 'QUALITY_CONTROL' },
  { key: 'READY' }
]

const nextStatus = {
  PENDING:         'IN_PRODUCTION',
  IN_PRODUCTION:   'QUALITY_CONTROL',
  QUALITY_CONTROL: 'READY',
  READY:           'DELIVERED',
  DELIVERED:       null
}

const previousStatus = {
  PENDING:         null,
  IN_PRODUCTION:   'PENDING',
  QUALITY_CONTROL: 'IN_PRODUCTION',
  READY:           'QUALITY_CONTROL',
  DELIVERED:       'READY'
}

function currentIndex() {
  return ORDER_FLOW.indexOf(props.workOrder.status)
}

function onAdvance() {
  const next = nextStatus[props.workOrder.status]
  if (next) { emit('statusChanged', next); requestClose() }
}

function onGoBack() {
  const previous = previousStatus[props.workOrder.status]
  if (previous) { emit('statusChanged', previous); requestClose() }
}

function priorityChipClass() {
  const priority = props.workOrder.priority
  if (priority === 'urgent') return 'priority-chip--urgent'
  if (priority === 'high')   return 'priority-chip--high'
  return 'priority-chip--normal'
}
</script>

<template>
  <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
    <div class="modal" @click.stop>

      <div class="modal-header">
        <div>
          <p class="order-id-small">{{ workOrder.id }}</p>
          <h3 class="order-patient">{{ workOrder.patientName }}</h3>
        </div>
        <button class="close-btn" @click="requestClose">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="modal-body">

        <!-- Progress -->
        <div class="progress-section">
          <p class="section-label">{{ $t('labOrders.detail.orderProgress') }}</p>
          <div class="progress-bar">
            <template v-for="(col, i) in progressColumns" :key="col.key">
              <div class="progress-step" :class="{ 'progress-step--done': i <= currentIndex() }" />
              <i v-if="i < progressColumns.length - 1" class="pi pi-chevron-right progress-arrow" />
            </template>
          </div>
          <div class="progress-labels">
            <span
                v-for="col in progressColumns"
                :key="col.key"
                class="progress-label"
                :class="{ 'progress-label--active': workOrder.status === col.key }"
            >
              {{ $t(`labOrders.status.${col.key}`) }}
            </span>
          </div>
        </div>

        <!-- Info grid -->
        <div class="info-grid">
          <div class="info-card">
            <p class="info-card-label">{{ $t('labOrders.detail.productType') }}</p>
            <p class="info-card-value">{{ workOrder.lensType || '—' }}</p>
          </div>
          <div class="info-card">
            <p class="info-card-label">{{ $t('labOrders.detail.frame') }}</p>
            <p class="info-card-value">{{ workOrder.frame || '—' }}</p>
          </div>
          <div class="info-card">
            <p class="info-card-label">{{ $t('labOrders.detail.laboratory') }}</p>
            <p class="info-card-value">{{ workOrder.laboratoryName || '—' }}</p>
          </div>
          <div class="info-card">
            <p class="info-card-label">{{ $t('labOrders.detail.expectedDate') }}</p>
            <p class="info-card-value">{{ workOrder.deliveryDate }}</p>
          </div>
        </div>

        <!-- Prescription -->
        <div class="recipe-box">
          <div class="recipe-header">
            <i class="pi pi-eye" style="color: #00c1b0" />
            <span class="recipe-title">{{ $t('labOrders.detail.opticalPrescription') }}</span>
          </div>
          <p class="recipe-text">{{ workOrder.prescription || `Prescription ID: ${workOrder.recipeId}` }}</p>
        </div>

        <!-- Payment summary -->
        <div class="payment-box">
          <p class="section-label">{{ $t('labOrders.detail.paymentSummary') }}</p>
          <div class="payment-row">
            <span class="payment-label">{{ $t('labOrders.detail.totalAmount') }}</span>
            <span class="payment-value">S/ {{ (workOrder.total || 0).toFixed(2) }}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">{{ $t('labOrders.detail.depositPaid') }}</span>
            <span class="payment-value payment-value--green">
              - S/ {{ (workOrder.deposit || 0).toFixed(2) }}
            </span>
          </div>
          <div class="payment-row payment-row--total">
            <span class="payment-label">{{ $t('labOrders.detail.pendingBalance') }}</span>
            <span
                class="payment-value"
                :class="(workOrder.total - workOrder.deposit) > 0 ? 'payment-value--orange' : 'payment-value--green'"
            >
              S/ {{ Math.max(0, (workOrder.total || 0) - (workOrder.deposit || 0)).toFixed(2) }}
            </span>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <span class="priority-chip" :class="priorityChipClass()">
          {{ $t(`labOrders.priority.${workOrder.priority || 'normal'}`) }}
        </span>
        <div class="footer-actions">
          <button v-if="previousStatus[workOrder.status]" class="back-btn" @click="onGoBack">
            <i class="pi pi-chevron-left" />
            {{ $t(`labOrders.status.${previousStatus[workOrder.status]}`) }}
          </button>
          <button v-if="nextStatus[workOrder.status]" class="advance-btn-modal" @click="onAdvance">
            {{ $t('labOrders.detail.moveTo') }} "{{ $t(`labOrders.status.${nextStatus[workOrder.status]}`) }}"
            <i class="pi pi-chevron-right" />
          </button>
          <span v-else class="completed-label">{{ $t('labOrders.detail.completed') }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.order-id-small { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #9ca3af; margin: 0; }
.order-patient { font-family: 'Josefin Sans', sans-serif; font-size: 1.15rem; font-weight: 700; color: #111827; margin: 2px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 1; }
.section-label { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; font-weight: 600; color: #6b7280; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
.progress-bar { display: flex; align-items: center; gap: 4px; }
.progress-step { height: 8px; border-radius: 4px; flex: 1; background: #e5e7eb; transition: background 0.2s; }
.progress-step--done { background: #00c1b0; }
.progress-arrow { font-size: 0.6rem; color: #d1d5db; flex-shrink: 0; }
.progress-labels { display: flex; justify-content: space-between; margin-top: 6px; }
.progress-label { font-family: 'Montserrat', sans-serif; font-size: 0.7rem; color: #9ca3af; }
.progress-label--active { color: #00c1b0; font-weight: 700; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.info-card { background: #f9fafb; border-radius: 10px; padding: 12px; }
.info-card-label { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #6b7280; margin: 0 0 4px; }
.info-card-value { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; color: #111827; margin: 0; }
.recipe-box { background: rgba(150,246,238,0.2); border-radius: 10px; padding: 14px; }
.recipe-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.recipe-title { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 700; color: #00c1b0; }
.recipe-text { font-family: 'Courier New', monospace; font-size: 0.78rem; color: #1f2937; margin: 0; }
.payment-box { background: #f9fafb; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.payment-row { display: flex; justify-content: space-between; align-items: center; }
.payment-row--total { border-top: 1px solid #e5e7eb; padding-top: 8px; }
.payment-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.payment-value { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; color: #111827; }
.payment-value--green { color: #16a34a; }
.payment-value--orange { color: #ea580c; }
.modal-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-top: 1px solid #f3f4f6; flex-shrink: 0; gap: 10px; }
.priority-chip { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; flex-shrink: 0; }
.priority-chip--urgent { background: #fee2e2; color: #b91c1c; }
.priority-chip--high   { background: #ffedd5; color: #c2410c; }
.priority-chip--normal { background: #f3f4f6; color: #6b7280; }
.footer-actions { display: flex; align-items: center; gap: 8px; }
.back-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.back-btn:hover { background: #e5e7eb; }
.advance-btn-modal { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #00c1b0; color: #fff; border: none; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.advance-btn-modal:hover { opacity: 0.9; }
.completed-label { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #16a34a; font-weight: 600; }
</style>