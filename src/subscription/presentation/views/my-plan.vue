<script setup>
/**
 * MyPlan view — Subscription bounded context.
 *
 * Displays the current user's active subscription details and exposes
 * a cancellation action. All text is resolved through vue-i18n so the
 * view works in both Spanish and English without any hardcoded strings.
 */

import { onMounted }                from 'vue'
import { useI18n }                  from 'vue-i18n'
import { useConfirm }               from 'primevue/useconfirm'
import { useToast }                 from 'primevue/usetoast'
import { useSubscriptionStore }     from '../../application/subscription.store.js'

const { t }   = useI18n()
const confirm = useConfirm()
const toast   = useToast()
const store   = useSubscriptionStore()

/**
 * Loads all subscription records when the view mounts.
 * Guards against redundant API calls when records are already loaded.
 */
onMounted(() => {
  if (!store.subscriptionsLoaded) {
    store.fetchAll()
  }
})

/**
 * Formats an ISO 8601 date string using the browser's locale.
 *
 * @param {string} isoDate - ISO 8601 date string.
 * @returns {string} Locale-formatted date string.
 */
function formatDate(isoDate) {
  if (!isoDate) return '-'
  return new Date(isoDate).toLocaleDateString()
}

/**
 * Prompts the user for confirmation before cancelling the active subscription.
 * On acceptance delegates to the store and shows a toast notification.
 *
 * @returns {void}
 */
function confirmCancel() {
  confirm.require({
    message:      t('subscription.myPlan.confirm.cancelMessage'),
    header:       t('subscription.myPlan.confirm.cancelHeader'),
    icon:         'pi pi-exclamation-triangle',
    acceptLabel:  t('subscription.myPlan.confirm.cancelAccept'),
    rejectLabel:  t('common.cancel'),
    acceptClass:  'p-button-danger',
    accept: () => {
      store.cancelSubscription(store.currentSubscription.id)
      toast.add({
        severity: 'info',
        summary:  t('subscription.myPlan.toast.cancelledSummary'),
        detail:   t('subscription.myPlan.toast.cancelledDetail'),
        life:     3000
      })
    }
  })
}
</script>

<template>
  <div class="plan-page">

    <!-- Page header -->
    <div class="page-header">
      <h2 class="page-title">{{ t('subscription.myPlan.pageTitle') }}</h2>
      <p class="page-sub">{{ t('subscription.myPlan.pageSubtitle') }}</p>
    </div>

    <!-- Loading indicator -->
    <div v-if="store.loading" class="loading-wrap">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #00c1b0;" aria-hidden="true" />
    </div>

    <!-- Empty state — no subscription found -->
    <div v-else-if="!store.currentSubscription" class="empty-state">
      <i class="pi pi-credit-card empty-icon" aria-hidden="true" />
      <h3>{{ t('subscription.myPlan.noSubscription') }}</h3>
      <p>{{ t('subscription.myPlan.noSubscriptionHint') }}</p>
    </div>

    <!-- Active subscription detail -->
    <div v-else class="plan-grid">

      <!-- Main plan card -->
      <div class="plan-card">
        <div class="plan-card__header">
          <div class="plan-badge-wrap">
            <span class="plan-badge">
              <i class="pi pi-star-fill" aria-hidden="true" />
              {{ store.currentSubscription.planName }}
            </span>
            <span
                class="status-pill"
                :class="store.currentSubscription.isActive ? 'status-pill--active' : 'status-pill--cancelled'"
            >
              {{ store.currentSubscription.isActive
                ? t('subscription.myPlan.status.active')
                : t('subscription.myPlan.status.cancelled') }}
            </span>
          </div>
          <p class="plan-price">
            {{ store.currentSubscription.formattedPrice }}
            <span class="plan-price__period">{{ t('subscription.myPlan.perMonth') }}</span>
          </p>
        </div>

        <div class="plan-card__body">
          <div class="detail-row">
            <span class="detail-label">
              <i class="pi pi-calendar" aria-hidden="true" />
              {{ t('subscription.myPlan.startDate') }}
            </span>
            <span class="detail-value">{{ formatDate(store.currentSubscription.startDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">
              <i class="pi pi-calendar-times" aria-hidden="true" />
              {{ t('subscription.myPlan.nextBilling') }}
            </span>
            <span class="detail-value">{{ formatDate(store.currentSubscription.endDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">
              <i class="pi pi-tag" aria-hidden="true" />
              {{ t('subscription.myPlan.planId') }}
            </span>
            <span class="detail-value mono">{{ store.currentSubscription.planId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">
              <i class="pi pi-shield" aria-hidden="true" />
              {{ t('subscription.myPlan.stripeSession') }}
            </span>
            <span class="detail-value mono truncate">{{ store.currentSubscription.stripeSessionId }}</span>
          </div>
        </div>

        <div v-if="store.currentSubscription.isActive" class="plan-card__footer">
          <pv-button
              :label="t('subscription.myPlan.cancelSubscription')"
              icon="pi pi-times"
              severity="danger"
              outlined
              size="small"
              @click="confirmCancel"
          />
        </div>
      </div>

      <!-- Subscription history (shown when more than one record exists) -->
      <div v-if="store.subscriptions.length > 1" class="history-card">
        <h3 class="history-title">{{ t('subscription.myPlan.history') }}</h3>
        <div
            v-for="sub in store.subscriptions"
            :key="sub.id"
            class="history-item"
            :class="{ 'history-item--active': sub.isActive }"
        >
          <div>
            <span class="history-plan">{{ sub.planName }}</span>
            <span class="history-date">{{ formatDate(sub.startDate) }}</span>
          </div>
          <span
              class="status-pill status-pill--sm"
              :class="sub.isActive ? 'status-pill--active' : 'status-pill--cancelled'"
          >
            {{ sub.isActive
              ? t('subscription.myPlan.status.active')
              : t('subscription.myPlan.status.cancelled') }}
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.plan-page { padding: 28px 32px; }

.page-header { margin-bottom: 24px; }

.page-title {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 1.4rem; font-weight: 700; color: #101828; margin: 0 0 4px;
}

.page-sub { font-size: 0.875rem; color: #6b7280; margin: 0; }

.loading-wrap { display: flex; align-items: center; justify-content: center; height: 200px; }

.empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
.empty-icon { font-size: 3rem; color: #d1d5db; display: block; margin-bottom: 16px; }

.plan-grid { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 580px; }

.plan-card, .history-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden;
}

.plan-card__header {
  background: linear-gradient(135deg, #03070a 0%, #0d2230 100%);
  padding: 24px 24px 20px;
}

.plan-badge-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }

.plan-badge {
  display: flex; align-items: center; gap: 6px;
  background: rgba(0,193,176,0.2); border: 1px solid rgba(0,193,176,0.4);
  border-radius: 999px; padding: 4px 14px;
  font-size: 0.8rem; font-weight: 600; color: #00e5d1;
}

.plan-price {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 1.8rem; font-weight: 700; color: #fff; margin: 0;
}

.plan-price__period { font-size: 0.9rem; font-weight: 400; color: #93c1ce; margin-left: 4px; }

.status-pill {
  padding: 3px 10px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em;
}

.status-pill--active    { background: #dcfce7; color: #16a34a; }
.status-pill--cancelled { background: #fee2e2; color: #dc2626; }
.status-pill--sm        { font-size: 0.68rem; padding: 2px 8px; }

.plan-card__body { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }

.detail-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid #f3f4f6; gap: 12px;
}

.detail-row:last-child { border-bottom: none; }

.detail-label {
  font-size: 0.82rem; color: #6b7280;
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
}

.detail-value { font-size: 0.84rem; font-weight: 500; color: #101828; text-align: right; }
.mono { font-family: monospace; font-size: 0.78rem; }
.truncate { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.plan-card__footer { padding: 16px 24px; border-top: 1px solid #f3f4f6; }

.history-card { padding: 20px 24px; }
.history-title { font-size: 0.875rem; font-weight: 600; color: #374151; margin: 0 0 12px; }

.history-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid #f3f4f6;
}

.history-item--active .history-plan { color: #00c1b0; }
.history-plan { font-size: 0.84rem; font-weight: 500; color: #374151; display: block; }
.history-date { font-size: 0.75rem; color: #9ca3af; }
</style>