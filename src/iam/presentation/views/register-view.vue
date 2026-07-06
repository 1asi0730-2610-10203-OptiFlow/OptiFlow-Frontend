<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../application/auth.store.js'
import { SubscriptionApi } from '../../../subscription/infrastructure/subscription-api.js'

const authStore = useAuthStore()
const subscriptionApi = new SubscriptionApi()
const router = useRouter()
const route = useRoute()

// When a plan is passed (from the pricing page), this is an admin-only purchase: register → Stripe → login.
const buyTier = (route.query.plan || '').toString().toUpperCase()
const buyPeriod = route.query.period === 'yearly' ? 'yearly' : 'monthly'
const isBuyMode = computed(() => !!buyTier)

const form = reactive({ email: '', password: '', confirmPassword: '', userType: 'client' })
const localError = ref(null)
const successMsg = ref(null)

onMounted(() => authStore.clearError())

function validate() {
  if (form.password !== form.confirmPassword) {
    localError.value = 'Las contraseñas no coinciden.'
    return false
  }
  if (form.password.length < 8) {
    localError.value = 'La contraseña debe tener al menos 8 caracteres.'
    return false
  }
  return true
}

async function handleSubmit() {
  localError.value = null
  successMsg.value = null
  if (!validate()) return

  if (isBuyMode.value) {
    // Register the administrator, keep the session just long enough to open Stripe, then (post-payment) login.
    const registered = await authStore.signUpAdminForCheckout(form.email, form.password)
    if (!registered) return
    await startCheckout()
    return
  }

  const ok = await authStore.signUp(form.email, form.password, form.userType)
  if (ok) {
    // Role is now persisted by the backend; the redirect after login is driven by it.
    successMsg.value = 'Registro exitoso. Redirigiendo al login...'
    setTimeout(() => router.push('/login'), 1500)
  }
}

async function startCheckout() {
  try {
    const plans = await subscriptionApi.getPlans()
    const wantYearly = buyPeriod === 'yearly'
    const plan =
      plans.find((p) => (p.tier || '').toUpperCase() === buyTier &&
        (wantYearly ? /anual/i.test(p.name ?? '') : /mensual/i.test(p.name ?? ''))) ||
      plans.find((p) => (p.tier || '').toUpperCase() === buyTier)
    if (!plan) {
      localError.value = 'No encontramos el plan seleccionado. Intenta desde la página de planes.'
      return
    }
    const { checkoutUrl } = await subscriptionApi.createCheckoutSession(plan.id, plan.name, plan.price)
    // After paying, the new admin should sign in fresh.
    sessionStorage.setItem('postPurchaseRedirect', 'login')
    if (/^https?:\/\//i.test(checkoutUrl)) {
      window.location.href = checkoutUrl
      return
    }
    // Dev-activate (relative URL): the subscription is already active — go straight to login as requested.
    authStore.logout()
    router.push('/login')
  } catch (err) {
    localError.value = err.response?.data?.detail || err.response?.data?.message || 'No se pudo iniciar el pago. Intenta de nuevo.'
  }
}
</script>

<template>
  <div class="login-page">

    <div class="login-brand">
      <span class="brand-name">OptiFlow</span>
      <span class="brand-sub">ERP / CRM Óptico</span>
    </div>

    <h1 class="login-title">{{ isBuyMode ? 'Crea tu óptica' : 'Crear Cuenta' }}</h1>

    <div class="login-card">

      <form @submit.prevent="handleSubmit" class="card-fields" novalidate>

        <p v-if="isBuyMode" class="form-success-top">
          Registra tu cuenta de administrador para continuar con el pago del plan {{ buyTier }} ({{ buyPeriod === 'yearly' ? 'anual' : 'mensual' }}).
        </p>

        <p v-if="localError" class="form-error-top">{{ localError }}</p>
        <p v-if="authStore.error" class="form-error-top">{{ authStore.error }}</p>
        <p v-if="successMsg" class="form-success-top">{{ successMsg }}</p>

        <div class="field" v-if="!isBuyMode">
          <label class="field-label">Tipo de Usuario</label>
          <div class="input-wrap">
            <i class="pi pi-user input-icon" />
            <select
                v-model="form.userType"
                class="field-input select-input"
                required
            >
              <option value="admin">Administrador</option>
              <option value="client">Cliente</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Email</label>
          <div class="input-wrap">
            <i class="pi pi-envelope input-icon" />
            <input
                v-model="form.email"
                type="email"
                class="field-input"
                placeholder="youremail@gmail.com"
                required
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label">Contraseña</label>
          <div class="input-wrap">
            <i class="pi pi-lock input-icon" />
            <input
                v-model="form.password"
                type="password"
                class="field-input"
                placeholder="Mínimo 8 caracteres"
                required
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label">Confirmar Contraseña</label>
          <div class="input-wrap">
            <i class="pi pi-lock input-icon" />
            <input
                v-model="form.confirmPassword"
                type="password"
                class="field-input"
                :class="{ 'input-error': localError && form.password !== form.confirmPassword }"
                placeholder="Repite la contraseña"
                required
            />
          </div>
        </div>

        <div class="btn-wrap">
          <button type="submit" class="btn-continue" :disabled="authStore.loading || !!successMsg">
            <i v-if="authStore.loading" class="pi pi-spin pi-spinner" />
            <span v-else>{{ isBuyMode ? 'Continuar al pago' : 'Registrarse' }}</span>
          </button>
        </div>

      </form>

      <div class="card-footer">
        <div class="footer-links">
          <span class="link-text">¿Ya tienes cuenta?</span>
          <span class="link-text link-highlight" @click="router.push('/login')">Inicia sesión!</span>
        </div>
      </div>

    </div>

    <p class="page-footer">© 2026 OptiFlow · Gestión integral para ópticas</p>

  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #03070a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 16px;
}

.login-brand {
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
  letter-spacing: 0.18px;
  line-height: 36px;
}

.brand-sub {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #93c1ce;
  line-height: 18px;
}

.login-title {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 42px;
}

.login-card {
  width: 100%;
  max-width: 381px;
  background: #0d1a1f;
  border: 1.27px solid rgba(0, 193, 176, 0.15);
  border-radius: 16px;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.card-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 25px 25px 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #93c1ce;
  line-height: 21px;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(147, 193, 206, 0.6);
  font-size: 14px;
  pointer-events: none;
}

.field-input {
  width: 100%;
  height: 43.5px;
  background: #03070a;
  border: 1.27px solid rgba(0, 193, 176, 0.25);
  border-radius: 10px;
  padding: 10px 16px 10px 40px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #93c1ce;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.field-input::placeholder { color: rgba(147, 193, 206, 0.5); }
.field-input:focus { border-color: rgba(0, 193, 176, 0.6); }

.select-input {
  cursor: pointer;
}
.select-input option {
  background: #0d1a1f;
  color: #93c1ce;
}

.form-error-top {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #f87171;
  text-align: center;
  margin: 0 0 10px 0;
}

.form-success-top {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #00c1b0;
  text-align: center;
  margin: 0 0 10px 0;
}

.field-input.input-error {
  color: #f87171;
  border-color: #f87171;
}

.btn-wrap {
  padding-top: 4px;
  padding-bottom: 25px;
}

.btn-continue {
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

.btn-continue:hover:not(:disabled) { opacity: 0.88; }
.btn-continue:disabled { opacity: 0.5; cursor: not-allowed; }

.card-footer {
  border-top: 1.27px solid rgba(0, 193, 176, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 25px;
}

.footer-links {
  display: flex;
  gap: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;
}

.link-text       { color: #93c1ce; }
.link-highlight  { color: #00c1b0; cursor: pointer; }
.link-highlight:hover { text-decoration: underline; }

.page-footer {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #93c1ce;
  opacity: 0.6;
  line-height: 18px;
  margin: 0;
}
</style>
