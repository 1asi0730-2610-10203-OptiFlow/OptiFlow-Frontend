<script setup>
import { computed, onMounted } from 'vue'
import { useOrderStore } from '../../application/order.store.js'
import { useAuthStore } from '../../../iam/application/auth.store.js'
import { useI18n } from 'vue-i18n'

const store = useOrderStore()
const authStore = useAuthStore()
const { t } = useI18n()

const today = computed(() => new Date().toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric'
}))

onMounted(async () => {
    const email = authStore.currentUser?.email
    if (email) await store.fetchAllPatientOrders(email)
})

const orders = computed(() => store.patientOrders.map(o => ({
    id: o.workOrderId,
    orderNumber: o.orderNumber,
    productName: o.lensType,
    status: o.status,
    estimatedDate: o.deliveryDate,
    createdAt: o.createdAt,
    totalAmount: o.total,
    paidAmount: o.deposit,
    pendingBalance: o.pendingBalance
})))

const getPaymentPercentage = (order) => {
    if (!order || !order.totalAmount) return 0
    return Math.round((order.paidAmount / order.totalAmount) * 100)
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">{{ $t('patientCenter.myLenses.title') }}</h1>
      <p class="page-subtitle">{{ $t('patientCenter.myLenses.subtitle', { date: today }) }}</p>
    </div>

    <!-- Resultados en lista scrollable -->
    <div class="orders-list">
      <div v-if="store.loading" style="text-align: center; padding: 40px; color: #9ca3af;">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
        <p style="font-family: 'Montserrat'; margin-top: 10px;">{{ $t('common.loading') }}...</p>
      </div>
      
      <div v-else-if="orders.length === 0" style="text-align: center; padding: 40px; color: #9ca3af;">
        <p style="font-family: 'Montserrat';">{{ $t('common.noResults') }}</p>
      </div>

      <div v-for="order in orders" :key="order.id" class="results-container">
        
        <!-- Order Card -->
        <div class="order-card dark">
          <div class="card-header">
             <div>
               <span class="label">{{ $t('patientCenter.myLenses.orderNumber') }}</span>
               <h2 class="value">{{ order.orderNumber }}</h2>
             </div>
             <div style="text-align: right">
               <span class="label">{{ $t('patientCenter.myLenses.creationDate') }}</span>
               <div class="value-small">{{ order.createdAt }}</div>
             </div>
          </div>

          <div class="order-tracker">
             <div class="step" :class="{active: true}">
                <div class="step-icon"><i class="pi pi-check"></i></div>
                <div class="step-text">
                  <div class="step-title">{{ $t('patientCenter.myLenses.status.lab') }}</div>
                  <div class="step-desc">{{ $t('patientCenter.myLenses.status.labDesc') }}</div>
                </div>
             </div>
             <div class="step-connector"></div>
             <div class="step" :class="{active: order.status !== 'IN_PRODUCTION'}">
                <div class="step-icon"><i class="pi pi-exclamation-circle"></i></div>
                <div class="step-text">
                  <div class="step-title">{{ $t('patientCenter.myLenses.status.qc') }}</div>
                  <div class="step-desc">{{ $t('patientCenter.myLenses.status.qcDesc') }}</div>
                </div>
             </div>
             <div class="step-connector"></div>
             <div class="step" :class="{active: order.status === 'READY' || order.status === 'DELIVERED'}">
                <div class="step-icon"><i class="pi pi-check-circle"></i></div>
                <div class="step-text">
                  <div class="step-title">{{ $t('patientCenter.myLenses.status.ready') }}</div>
                  <div class="step-desc">{{ $t('patientCenter.myLenses.status.readyDesc') }}</div>
                </div>
             </div>
          </div>

          <div class="card-footer">
             <div>
               <span class="label">{{ $t('patientCenter.myLenses.lensType') }}</span>
               <div class="value-medium">{{ order.productName }}</div>
             </div>
             <div style="text-align: right; display: flex; align-items: center; gap: 8px; color: #00c1b0; font-size: 0.85rem">
               <i class="pi pi-clock"></i> {{ $t('patientCenter.myLenses.estimatedDelivery') }}: {{ order.estimatedDate }}
             </div>
          </div>
        </div>

        <!-- Payment Card -->
        <div class="payment-card">
           <div class="payment-header">
             <div class="payment-icon"><i class="pi pi-credit-card"></i></div>
             <div>
               <h3 class="payment-title">{{ $t('patientCenter.myLenses.paymentTitle') }}</h3>
               <p class="payment-subtitle">{{ $t('patientCenter.myLenses.paymentSubtitle') }}</p>
             </div>
           </div>
           
           <div class="payment-rows">
             <div class="payment-row">
               <span>{{ $t('patientCenter.myLenses.totalAmount') }}</span>
               <strong>S/ {{ order.totalAmount.toFixed(2) }}</strong>
             </div>
             <div class="payment-row">
               <span>{{ $t('patientCenter.myLenses.paidAmount') }}</span>
               <strong style="color: #00c1b0">S/ {{ order.paidAmount.toFixed(2) }}</strong>
             </div>
             <div class="payment-row divider">
               <span>{{ $t('patientCenter.myLenses.pendingBalance') }}</span>
               <strong style="color: #ef4444">S/ {{ order.pendingBalance.toFixed(2) }}</strong>
             </div>
           </div>

           <div class="payment-progress-container">
             <span class="progress-label">{{ $t('patientCenter.myLenses.paymentProgress') }}</span>
             <div class="progress-bar-bg">
                <div class="progress-bar-fill" :style="{ width: getPaymentPercentage(order) + '%' }"></div>
             </div>
             <span class="progress-percent">{{ $t('patientCenter.myLenses.percentPaid', { percent: getPaymentPercentage(order) }) }}</span>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
.page-header { margin-bottom: 10px; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #03070a; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #6b7280; }

.orders-list { display: flex; flex-direction: column; gap: 32px; overflow-y: auto; padding-bottom: 30px; }
.results-container { display: flex; flex-direction: column; gap: 20px; }

.order-card.dark { background: #1e2530; color: white; border-radius: 14px; padding: 28px; }
.order-card .label { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #9ca3af; }
.order-card .value { font-family: 'Josefin Sans', sans-serif; font-size: 1.8rem; font-weight: 700; margin-top: 4px; }
.order-card .value-small { font-family: 'Montserrat', sans-serif; font-size: 0.9rem; font-weight: 500; margin-top: 4px; }
.order-card .value-medium { font-family: 'Montserrat', sans-serif; font-size: 1.1rem; font-weight: 600; margin-top: 4px; }

.card-header, .card-footer { display: flex; justify-content: space-between; align-items: flex-end; }
.card-footer { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 20px; }

.order-tracker { display: flex; align-items: center; justify-content: space-between; margin: 32px 0; }
.step { display: flex; align-items: center; gap: 12px; opacity: 0.4; }
.step.active { opacity: 1; }
.step-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.step.active .step-icon { background: #00c1b0; color: white; }
.step-title { font-family: 'Montserrat', sans-serif; font-size: 0.9rem; font-weight: 600; }
.step-desc { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #9ca3af; }
.step-connector { flex: 1; height: 2px; background: rgba(255,255,255,0.1); margin: 0 16px; }

.payment-card { background: #fff; border-radius: 14px; padding: 28px; border: 1px solid #f3f4f6; }
.payment-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.payment-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(0, 193, 176, 0.1); color: #00c1b0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.payment-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.2rem; font-weight: 700; color: #03070a; }
.payment-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #6b7280; margin-top: 2px; }

.payment-rows { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.payment-row { display: flex; justify-content: space-between; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 0.95rem; color: #6b7280; }
.payment-row strong { font-size: 1.1rem; color: #03070a; font-family: 'Montserrat', sans-serif; font-weight: 700; }
.payment-row.divider { border-top: 1px solid #f3f4f6; padding-top: 16px; }

.payment-progress-container { display: flex; flex-direction: column; gap: 8px; }
.progress-label, .progress-percent { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #6b7280; }
.progress-bar-bg { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #00c1b0; border-radius: 4px; transition: width 0.3s ease; }
</style>
