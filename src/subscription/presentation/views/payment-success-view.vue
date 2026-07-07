<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SubscriptionApi } from '../../infrastructure/subscription-api.js'
import { useAuthStore } from '../../../iam/application/auth.store.js'

const subscriptionApi = new SubscriptionApi()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const state = ref('confirming') // 'confirming' | 'success' | 'error'

async function confirm() {
  const sessionId = route.query.session_id
  // The payment may take a moment to settle; retry a few times before giving up.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const { active } = await subscriptionApi.confirmCheckout(sessionId)
      if (active) {
        authStore.setSubscriptionActive(true)
        state.value = 'success'
        // A purchase made from the pricing/registration funnel ends at the login screen; otherwise
        // (an already-signed-in admin) go straight to the dashboard.
        if (sessionStorage.getItem('postPurchaseRedirect') === 'login') {
          sessionStorage.removeItem('postPurchaseRedirect')
          authStore.logout()
          setTimeout(() => router.push('/login'), 1600)
        } else {
          setTimeout(() => router.push('/panel'), 1600)
        }
        return
      }
    } catch {
      // ignore and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  state.value = 'error'
}

onMounted(confirm)
</script>

<template>
  <div class="page">
    <div class="card">
      <p class="brand">{{ $t('app.name') }}</p>

      <template v-if="state === 'confirming'">
        <div class="spinner" />
        <h1>{{ $t('subscription.paymentSuccess.confirmingTitle') }}</h1>
        <p class="muted">{{ $t('subscription.paymentSuccess.confirmingSubtitle') }}</p>
      </template>

      <template v-else-if="state === 'success'">
        <div class="check">✓</div>
        <h1>{{ $t('subscription.paymentSuccess.successTitle') }}</h1>
        <p class="muted">{{ $t('subscription.paymentSuccess.successSubtitle') }}</p>
      </template>

      <template v-else>
        <div class="cross">!</div>
        <h1>{{ $t('subscription.paymentSuccess.errorTitle') }}</h1>
        <p class="muted">{{ $t('subscription.paymentSuccess.errorSubtitle') }}</p>
        <div class="actions">
          <button class="btn" @click="confirm">{{ $t('subscription.paymentSuccess.retry') }}</button>
          <button class="btn ghost" @click="router.push('/select-plan')">{{ $t('subscription.paymentSuccess.backToPlans') }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b0f14;
  color: #e6edf3;
  padding: 24px;
}
.card {
  width: 100%;
  max-width: 420px;
  text-align: center;
  background: #121821;
  border: 1px solid #1f2a37;
  border-radius: 16px;
  padding: 40px 28px;
}
.brand { color: #2dd4bf; font-weight: 700; letter-spacing: 1px; margin-bottom: 20px; }
h1 { font-size: 1.35rem; margin: 16px 0 8px; }
.muted { color: #94a3b8; font-size: 0.95rem; }
.check, .cross {
  width: 64px; height: 64px; line-height: 64px; margin: 0 auto;
  border-radius: 50%; font-size: 2rem; font-weight: 700;
}
.check { background: rgba(45, 212, 191, 0.15); color: #2dd4bf; }
.cross { background: rgba(248, 113, 113, 0.15); color: #f87171; }
.spinner {
  width: 48px; height: 48px; margin: 0 auto;
  border: 4px solid #1f2a37; border-top-color: #2dd4bf; border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
.btn {
  background: #2dd4bf; color: #04231f; border: none; border-radius: 10px;
  padding: 10px 18px; font-weight: 600; cursor: pointer;
}
.btn.ghost { background: transparent; color: #94a3b8; border: 1px solid #1f2a37; }
</style>
