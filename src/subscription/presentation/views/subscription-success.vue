<script setup>
/**
 * SubscriptionSuccess view.
 *
 * Stripe redirects the user to this route after a successful Checkout session:
 *   /subscription/success?session_id=cs_test_xxx&plan_id=pro&plan_name=Pro&price=29.99
 *
 * On mount the view reads the query-string parameters, calls the store to
 * persist the subscription, and then reflects the result in the UI.
 * A sessionStorage flag prevents duplicate registrations on page refresh.
 */

import { ref, onMounted }         from 'vue'
import { useRoute, useRouter }     from 'vue-router'
import { useI18n }                 from 'vue-i18n'
import { useSubscriptionStore }    from '../../application/subscription.store.js'

const route  = useRoute()
const router = useRouter()
const { t }  = useI18n()
const store  = useSubscriptionStore()

/** @type {import('vue').Ref<'loading'|'success'|'already'|'error'>} */
const status = ref('loading')

/**
 * On mount, reads Stripe query params and delegates to the store.
 * Uses sessionStorage to guard against duplicate POST on refresh.
 */
onMounted(async () => {
  const sessionId = route.query.session_id
  const planId    = route.query.plan_id    ?? 'pro'
  const planName  = route.query.plan_name  ?? 'Pro'
  const price     = route.query.price      ?? '29.99'

  if (!sessionId) {
    status.value = 'error'
    return
  }

  const storageKey = `stripe_session_${sessionId}`
  if (sessionStorage.getItem(storageKey)) {
    status.value = 'already'
    return
  }

  try {
    await store.registerAfterPayment(sessionId, planId, planName, price)
    sessionStorage.setItem(storageKey, '1')
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
})

/**
 * Navigates to the active plan management view.
 * @returns {void}
 */
function goToMyPlan() {
  router.push({ name: 'subscription-my-plan' })
}

/**
 * Navigates to the main sales dashboard.
 * @returns {void}
 */
function goToDashboard() {
  router.push({ name: 'sale-list' })
}
</script>

<template>
  <div class="success-wrapper">

    <!-- Loading state -->
    <div v-if="status === 'loading'" class="success-card">
      <div class="spinner-wrap">
        <i class="pi pi-spin pi-spinner spinner-icon" aria-hidden="true" />
      </div>
      <p class="status-label">{{ t('subscription.success.activating') }}</p>
    </div>

    <!-- Payment registered successfully -->
    <div v-else-if="status === 'success'" class="success-card">
      <div class="icon-wrap icon-wrap--success">
        <i class="pi pi-check-circle" aria-hidden="true" />
      </div>
      <h1 class="success-title">{{ t('subscription.success.title') }}</h1>
      <p class="success-sub">
        {{ t('subscription.success.subtitle', { plan: store.currentSubscription?.planName }) }}
      </p>
      <div class="plan-badge">
        <i class="pi pi-star-fill" aria-hidden="true" />
        {{ store.currentSubscription?.formattedPrice }}
        {{ t('subscription.success.perMonth') }}
      </div>
      <div class="btn-row">
        <pv-button
            :label="t('subscription.success.viewPlan')"
            icon="pi pi-id-card"
            class="btn-primary"
            @click="goToMyPlan"
        />
        <pv-button
            :label="t('subscription.success.goToDashboard')"
            icon="pi pi-home"
            severity="secondary"
            outlined
            @click="goToDashboard"
        />
      </div>
    </div>

    <!-- Session already processed (page refresh guard) -->
    <div v-else-if="status === 'already'" class="success-card">
      <div class="icon-wrap icon-wrap--info">
        <i class="pi pi-info-circle" aria-hidden="true" />
      </div>
      <h1 class="success-title">{{ t('subscription.success.alreadyTitle') }}</h1>
      <p class="success-sub">{{ t('subscription.success.alreadySubtitle') }}</p>
      <pv-button
          :label="t('subscription.success.viewPlan')"
          icon="pi pi-id-card"
          @click="goToMyPlan"
      />
    </div>

    <!-- Error state -->
    <div v-else class="success-card">
      <div class="icon-wrap icon-wrap--error">
        <i class="pi pi-times-circle" aria-hidden="true" />
      </div>
      <h1 class="success-title">{{ t('subscription.success.errorTitle') }}</h1>
      <p class="success-sub">{{ t('subscription.success.errorSubtitle') }}</p>
      <pv-button
          :label="t('common.cancel')"
          severity="secondary"
          @click="goToDashboard"
      />
    </div>

  </div>
</template>

<style scoped>
.success-wrapper {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f9fafb;
}

.success-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 460px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.icon-wrap {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem;
}

.icon-wrap--success { background: #dcfce7; color: #16a34a; }
.icon-wrap--info    { background: #dbeafe; color: #2563eb; }
.icon-wrap--error   { background: #fee2e2; color: #dc2626; }

.spinner-wrap {
  width: 72px; height: 72px;
  display: flex; align-items: center; justify-content: center;
}

.spinner-icon { font-size: 2.5rem; color: #00c1b0; }

.status-label { font-size: 1rem; color: #6b7280; margin: 0; }

.success-title {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 1.6rem; font-weight: 700; color: #101828; margin: 0;
}

.success-sub { font-size: 0.95rem; color: #6b7280; margin: 0; line-height: 1.5; }

.plan-badge {
  display: flex; align-items: center; gap: 8px;
  background: rgba(0,193,176,0.1);
  border: 1px solid rgba(0,193,176,0.3);
  border-radius: 999px; padding: 8px 20px;
  font-size: 0.9rem; font-weight: 600; color: #0a9e90;
}

.plan-badge .pi { font-size: 0.85rem; }

.btn-row {
  display: flex; flex-direction: column; gap: 10px;
  width: 100%; margin-top: 8px;
}

.btn-primary { background: #00c1b0 !important; border-color: #00c1b0 !important; }
</style>