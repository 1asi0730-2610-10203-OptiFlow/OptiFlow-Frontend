<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SubscriptionApi } from '../../infrastructure/subscription-api.js'
import { useAuthStore } from '../../../iam/application/auth.store.js'

const subscriptionApi = new SubscriptionApi()
const router = useRouter()
const authStore = useAuthStore()

const plans = ref([])
const loadingPlans = ref(true)
const checkingOutPlanId = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    plans.value = await subscriptionApi.getPlans()
  } catch (err) {
    error.value = 'No se pudieron cargar los planes. Intenta de nuevo en unos segundos.'
  } finally {
    loadingPlans.value = false
  }
})

async function selectPlan(plan) {
  error.value = null
  checkingOutPlanId.value = plan.id
  try {
    const { checkoutUrl } = await subscriptionApi.createCheckoutSession(plan.id, plan.name, plan.price)
    // Dev-activate returns a relative app path with the subscription already active; real Stripe
    // returns an absolute hosted-checkout URL where activation happens on return.
    if (checkoutUrl.startsWith('/')) authStore.setSubscriptionActive(true)
    window.location.href = checkoutUrl
  } catch (err) {
    error.value = err.response?.data?.detail || err.response?.data?.message || 'No se pudo iniciar el pago. Intenta de nuevo.'
    checkingOutPlanId.value = null
  }
}
</script>

<template>
  <div class="plan-page">

    <div class="plan-brand">
      <span class="brand-name">OptiFlow</span>
      <span class="brand-sub">ERP / CRM Óptico</span>
    </div>

    <h1 class="plan-title">Elige tu plan</h1>
    <p class="plan-subtitle">Tu cuenta ya está creada. Selecciona un plan para activar tu suscripción con Stripe.</p>

    <p v-if="error" class="form-error-top">{{ error }}</p>

    <div v-if="loadingPlans" class="plan-loading">
      <i class="pi pi-spin pi-spinner" />
    </div>

    <div v-else class="plan-grid">
      <div v-for="plan in plans" :key="plan.id" class="plan-card">
        <span class="plan-tier">{{ plan.tier }}</span>
        <h2 class="plan-name">{{ plan.name }}</h2>
        <p class="plan-price">${{ plan.price }}<span class="plan-price-period">/mes</span></p>
        <p class="plan-description">{{ plan.description }}</p>
        <button
            class="btn-select"
            :disabled="checkingOutPlanId !== null"
            @click="selectPlan(plan)"
        >
          <i v-if="checkingOutPlanId === plan.id" class="pi pi-spin pi-spinner" />
          <span v-else>Continuar con Stripe</span>
        </button>
      </div>
    </div>

    <p class="page-footer">© 2026 OptiFlow · Gestión integral para ópticas</p>

  </div>
</template>

<style scoped>
.plan-page {
  min-height: 100vh;
  background: #03070a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 16px;
}

.plan-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.brand-name {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #00c1b0;
  line-height: 36px;
}

.brand-sub {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #93c1ce;
  line-height: 18px;
}

.plan-title {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 42px;
}

.plan-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #93c1ce;
  text-align: center;
  max-width: 480px;
  margin: 0;
}

.form-error-top {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #f87171;
  text-align: center;
  margin: 0;
}

.plan-loading {
  color: #00c1b0;
  font-size: 28px;
  padding: 40px 0;
}

.plan-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 960px;
  width: 100%;
}

.plan-card {
  width: 260px;
  background: #0d1a1f;
  border: 1.27px solid rgba(0, 193, 176, 0.15);
  border-radius: 16px;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.5);
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-tier {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #00c1b0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.plan-name {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 20px;
  color: #ffffff;
  margin: 0;
}

.plan-price {
  font-family: 'Montserrat', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  margin: 4px 0;
}

.plan-price-period {
  font-size: 13px;
  font-weight: 400;
  color: #93c1ce;
}

.plan-description {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #93c1ce;
  flex-grow: 1;
  margin: 0 0 16px 0;
}

.btn-select {
  width: 100%;
  height: 41px;
  background: #00c1b0;
  border: none;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-select:hover:not(:disabled) { opacity: 0.88; }
.btn-select:disabled { opacity: 0.5; cursor: not-allowed; }

.link-skip {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #93c1ce;
  cursor: pointer;
}
.link-skip:hover { text-decoration: underline; }

.page-footer {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #93c1ce;
  opacity: 0.6;
  margin: 0;
}
</style>
