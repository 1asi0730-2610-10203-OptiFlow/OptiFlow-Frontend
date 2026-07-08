<script setup>
import { computed, onMounted } from 'vue'
import { useOrderStore } from '../../application/order.store.js'
import { useAuthStore } from '../../../iam/application/auth.store.js'
import { useI18n } from 'vue-i18n'

const store     = useOrderStore()
const authStore = useAuthStore()
const { t }     = useI18n()

const today = computed(() => new Date().toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric'
}))

onMounted(async () => {
    const email = authStore.currentUser?.email
    if (email) await store.fetchAllPatientOrders(email)
})

const orders = computed(() => store.patientOrders.map(o => {
    const hasNoFrame = !o.frame || o.frame.includes('noFrame') || o.frame.includes('newOrderModal');
    
    return {
        id:             o.workOrderId,
        orderNumber:    o.orderNumber,
        productName:    o.lensType,
        hasNoFrame:     hasNoFrame, 
        frame:          hasNoFrame ? 'labOrders.newOrderModal.noFrame' : o.frame,
        status:         o.status,
        estimatedDate:  o.deliveryDate,
        createdAt:      o.createdAt,
        totalAmount:    o.total,
        paidAmount:     o.deposit,
        pendingBalance: o.pendingBalance
    }
}))

const getPaymentPercentage = (order) => {
    if (!order?.totalAmount) return 0
    return Math.round((order.paidAmount / order.totalAmount) * 100)
}

const getStatusStep = (status) => {
    const map = { PENDING: 0, IN_PRODUCTION: 1, QUALITY_CONTROL: 2, READY: 3, DELIVERED: 3 }
    return map[status] ?? 0
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">{{ $t('patientCenter.myLenses.title') }}</h1>
      <p class="page-subtitle">{{ $t('patientCenter.myLenses.subtitle', { date: today }) }}</p>
    </div>

    <div class="orders-list">

      <!-- Loading -->
      <div v-if="store.loading" class="empty-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
        <p>{{ $t('common.loading') }}...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <p>{{ $t('common.noResults') }}</p>
      </div>

      <!-- Orders -->
      <div v-for="order in orders" :key="order.id" class="order-wrapper">

        <!-- SECCIÓN 1: Tracker de estado -->
        <div class="tracker-card">
          <div class="tracker-header">
            <div>
              <span class="meta-label">{{ $t('patientCenter.myLenses.orderNumber') }}</span>
              <h2 class="order-number">{{ order.orderNumber }}</h2>
            </div>
            <div class="tracker-header__right">
              <span class="meta-label">{{ $t('patientCenter.myLenses.creationDate') }}</span>
              <div class="meta-value">{{ order.createdAt }}</div>
            </div>
          </div>

          <div class="tracker-steps">
            <template v-for="(step, index) in [
              { icon: 'pi-flask',            titleKey: 'status.lab',   descKey: 'status.labDesc'   },
              { icon: 'pi-wrench',           titleKey: 'status.prod',  descKey: 'status.prodDesc'  },
              { icon: 'pi-exclamation-circle', titleKey: 'status.qc', descKey: 'status.qcDesc'    },
              { icon: 'pi-check-circle',     titleKey: 'status.ready', descKey: 'status.readyDesc' },
            ]" :key="index">
              <div class="tracker-step" :class="{ 'step-active': getStatusStep(order.status) >= index }">
                <div class="step-icon-wrap">
                  <i :class="`pi ${step.icon}`"></i>
                </div>
                <div class="step-labels">
                  <span class="step-title">{{ $t(`patientCenter.myLenses.${step.titleKey}`) }}</span>
                  <span class="step-desc">{{ $t(`patientCenter.myLenses.${step.descKey}`) }}</span>
                </div>
              </div>
              <div v-if="index < 3" class="step-line"
                   :class="{ 'line-active': getStatusStep(order.status) > index }"></div>
            </template>
          </div>

          <div class="tracker-footer">
            <div>
              <span class="meta-label">{{ $t('patientCenter.myLenses.lensType') }}</span>
              <div class="meta-value" style="font-weight: 600; margin-top: 4px;">{{ order.productName }}</div>
            </div>
            <div class="delivery-badge">
              <i class="pi pi-clock"></i>
              {{ $t('patientCenter.myLenses.estimatedDelivery') }}: {{ order.estimatedDate }}
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: Boleta de pago -->
        <div class="receipt-card">
          <div class="receipt-top">
            <div class="receipt-title-group">
              <div class="receipt-icon"><i class="pi pi-receipt"></i></div>
              <div>
                <h3 class="receipt-title">{{ $t('patientCenter.myLenses.paymentSummary') }}</h3>
                <p class="receipt-subtitle">{{ $t('patientCenter.myLenses.orderDetail', { number: order.orderNumber }) }}</p>
              </div>
            </div>
            <span class="status-badge"
                  :class="order.pendingBalance > 0 ? 'badge-pending' : 'badge-paid'">
              {{ order.pendingBalance > 0
                  ? $t('patientCenter.myLenses.paymentPending')
                  : $t('patientCenter.myLenses.paymentComplete') }}
            </span>
          </div>

          <hr class="divider"/>

          <!-- Items -->
          <div class="receipt-items">
            <div class="receipt-row">
              <div class="item-detail">
                <span class="item-name">{{ order.productName }}</span>
                <span class="item-type">{{ $t('patientCenter.myLenses.opticalLenses') }}</span>
              </div>
              <span class="item-amount">S/ {{ order.totalAmount.toFixed(2) }}</span>
            </div>

            <div class="receipt-row">
              <div class="item-detail">
                <span class="item-name">
                  {{ order.hasNoFrame ? $t('patientCenter.myLenses.none') : order.frame }}
                </span>
                <span class="item-type">{{ $t('patientCenter.myLenses.frame') }}</span>
              </div>
              <span class="item-amount">
                {{ order.hasNoFrame ? $t('patientCenter.myLenses.notIncluded') : $t('patientCenter.myLenses.included') }}
              </span>
            </div>
          </div>

          <hr class="divider"/>

          <!-- Totales -->
          <div class="totals">
            <div class="total-line subtle">
              <span>{{ $t('patientCenter.myLenses.subtotal') }}</span>
              <span>S/ {{ order.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="total-line">
              <span>{{ $t('patientCenter.myLenses.advance') }}</span>
              <span class="text-teal">- S/ {{ order.paidAmount.toFixed(2) }}</span>
            </div>
            <hr class="divider"/>
            <div class="total-line bold">
              <span>{{ $t('patientCenter.myLenses.pendingBalance') }}</span>
              <span :class="order.pendingBalance > 0 ? 'text-red' : 'text-green'">
                S/ {{ order.pendingBalance.toFixed(2) }}
              </span>
            </div>
          </div>

          <hr class="divider"/>

          <!-- Progreso -->
          <div class="progress-section">
            <div class="progress-row">
              <span class="progress-label">{{ $t('patientCenter.myLenses.paymentProgress') }}</span>
              <span class="progress-pct">{{ getPaymentPercentage(order) }}% {{ $t('patientCenter.myLenses.paid') }}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: getPaymentPercentage(order) + '%' }"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
.page-header { margin-bottom: 4px; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #03070a; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #6b7280; }

.orders-list { display: flex; flex-direction: column; gap: 32px; }
.order-wrapper { display: flex; flex-direction: column; gap: 16px; }
.empty-state { text-align: center; padding: 40px; color: #9ca3af; font-family: 'Montserrat', sans-serif; }

/* Tracker */
.tracker-card { background: #1e2530; color: white; border-radius: 16px; padding: 28px; }
.tracker-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 12px; flex-wrap: wrap; }
.tracker-header__right { text-align: right; }
.meta-label { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
.order-number { font-family: 'Josefin Sans', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 4px 0 0; }
.meta-value { font-family: 'Montserrat', sans-serif; font-size: 0.88rem; margin-top: 4px; }

.tracker-steps { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.tracker-step { display: flex; align-items: center; gap: 10px; opacity: 0.3; transition: opacity 0.3s; }
.tracker-step.step-active { opacity: 1; }
.step-icon-wrap { width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.tracker-step.step-active .step-icon-wrap { background: #00c1b0; color: white; }
.step-title { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; display: block; }
.step-desc { font-family: 'Montserrat', sans-serif; font-size: 0.7rem; color: #9ca3af; display: block; }
.step-line { flex: 1; height: 2px; background: rgba(255,255,255,0.1); margin: 0 10px; transition: background 0.3s; }
.line-active { background: #00c1b0; }

.tracker-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; gap: 12px; flex-wrap: wrap; }
.delivery-badge { display: flex; align-items: center; gap: 6px; color: #00c1b0; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; }

/* Receipt */
.receipt-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.receipt-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
.receipt-title-group { display: flex; align-items: center; gap: 14px; }
.receipt-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(0,193,176,0.1); color: #00c1b0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.receipt-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.05rem; font-weight: 700; color: #03070a; margin: 0; }
.receipt-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #6b7280; margin: 2px 0 0; }

.status-badge { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
.badge-pending { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.badge-paid { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

.divider { border: none; border-top: 1px solid #f3f4f6; margin: 16px 0; }

.receipt-items { display: flex; flex-direction: column; gap: 12px; }
.receipt-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.item-detail { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.item-amount { flex-shrink: 0; text-align: right; }
.item-name { font-family: 'Montserrat', sans-serif; font-size: 0.88rem; font-weight: 600; color: #111827; }
.item-type { font-family: 'Montserrat', sans-serif; font-size: 0.73rem; color: #9ca3af; }
.item-amount { font-family: 'Montserrat', sans-serif; font-size: 0.92rem; font-weight: 600; color: #111827; }

.totals { display: flex; flex-direction: column; gap: 10px; }
.total-line { display: flex; justify-content: space-between; font-family: 'Montserrat', sans-serif; font-size: 0.88rem; color: #6b7280; }
.total-line.bold { font-size: 0.95rem; font-weight: 700; color: #111827; }
.total-line.subtle { color: #9ca3af; }
.text-teal { color: #00c1b0; font-weight: 600; }
.text-red { color: #ef4444; font-weight: 700; }
.text-green { color: #15803d; font-weight: 700; }

.progress-section { display: flex; flex-direction: column; gap: 8px; }
.progress-row { display: flex; justify-content: space-between; }
.progress-label { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #6b7280; }
.progress-pct { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; font-weight: 600; color: #00c1b0; }
.progress-track { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: #00c1b0; border-radius: 4px; transition: width 0.4s ease; }

/* Responsive */
@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .tracker-card { padding: 20px; }
  .receipt-card { padding: 18px; }
  .order-number { font-size: 1.5rem; }
}

@media (max-width: 560px) {
  .page { padding: 16px 12px; gap: 16px; }
  .orders-list { gap: 24px; }

  .tracker-header__right { text-align: left; }

  .tracker-steps { flex-direction: column; align-items: stretch; gap: 0; margin-bottom: 20px; }
  .tracker-step { width: 100%; }
  .step-line { flex: none; width: 2px; height: 18px; margin: 0 0 0 20px; }

  .tracker-footer { flex-direction: column; align-items: flex-start; }
  .delivery-badge { align-self: stretch; justify-content: center; padding: 8px; background: rgba(0,193,176,0.1); border-radius: 8px; }

  .receipt-top { align-items: flex-start; }
  .receipt-title-group { gap: 10px; }

  .receipt-row { flex-wrap: wrap; }
  .item-amount { width: 100%; text-align: left; }
}
</style>