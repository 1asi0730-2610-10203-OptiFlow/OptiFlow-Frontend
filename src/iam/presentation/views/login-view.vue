<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../application/auth.store.js'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email    = ref('')
const password = ref('')
const mode     = ref('admin') // 'admin' | 'client'
const showSuccessMsg = ref(false)
const googleButtonContainer = ref(null)
let googleReady = false

function setMode(next) {
  mode.value = next
  authStore.clearError()
  // The container only exists while in admin mode, so (re)render the button after the DOM updates.
  if (next === 'admin') nextTick(mountGoogleButton)
}

// Renders Google's official Sign-In button once the GSI script and a client id are both available.
// Returns true when the button was rendered so callers can stop polling.
function mountGoogleButton() {
  if (googleReady) return true
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || !window.google?.accounts?.id || !googleButtonContainer.value) return false

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async ({ credential }) => {
      const ok = await authStore.googleSignIn(credential)
      if (ok) router.push(await resolveRedirectPath())
    },
  })
  window.google.accounts.id.renderButton(googleButtonContainer.value, {
    theme: 'filled_black',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    width: 331,
  })
  googleReady = true
  return true
}

onMounted(() => {
  authStore.clearError()
  if (route.query.registered === 'true') {
    showSuccessMsg.value = true
  }
  // The GSI script is loaded async in index.html, so it may not be ready yet — retry briefly.
  if (!mountGoogleButton()) {
    let tries = 0
    const timer = setInterval(() => {
      if (mountGoogleButton() || ++tries >= 25) clearInterval(timer)
    }, 200)
  }
})

async function submit() {
  showSuccessMsg.value = false
  if (mode.value === 'client') {
    if (!email.value) return
    const ok = await authStore.clientSignIn(email.value)
    if (ok) router.push('/patient/my-lenses')
    return
  }
  if (!email.value || !password.value) return
  const ok = await authStore.signIn(email.value, password.value)
  if (ok) {
    router.push(await resolveRedirectPath())
  }
}

async function resolveRedirectPath() {
  // Clients go to the patient portal; admins need an active subscription before the dashboard.
  if (authStore.isClient) return '/patient/my-lenses'
  await authStore.refreshSubscription()
  return authStore.subscriptionActive ? '/panel' : '/select-plan'
}
</script>

<template>
  <div class="login-page">

    <div class="login-brand">
      <span class="brand-name">OptiFlow</span>
      <span class="brand-sub">ERP / CRM Óptico</span>
    </div>

    <h1 class="login-title">Inicia Sesión</h1>

    <div class="login-card">

      <div class="card-fields">

        <div class="mode-toggle">
          <button type="button" class="mode-btn" :class="{ active: mode === 'admin' }" @click="setMode('admin')">Óptica</button>
          <button type="button" class="mode-btn" :class="{ active: mode === 'client' }" @click="setMode('client')">Cliente</button>
        </div>

        <div v-if="showSuccessMsg" class="form-success-top">
          Registro exitoso.<br />Inicia sesión
        </div>

        <div class="field">
          <label class="field-label">{{ mode === 'client' ? 'Usuario' : 'Email' }}</label>
          <div class="input-wrap">
            <i class="pi pi-envelope input-icon" />
            <input
                v-model="email"
                type="email"
                class="field-input"
                placeholder="youremail@gmail.com"
                @keyup.enter="submit"
            />
          </div>
        </div>

        <div class="field" v-if="mode === 'admin'">
          <label class="field-label">Contraseña</label>
          <div class="input-wrap">
            <i class="pi pi-lock input-icon" />
            <input
                v-model="password"
                type="password"
                class="field-input"
                placeholder="••••••••"
                @keyup.enter="submit"
            />
          </div>
        </div>

        <p v-if="mode === 'client'" class="client-hint">Los clientes ingresan solo con su usuario.</p>

        <p v-if="authStore.error" class="field-error">{{ authStore.error }}</p>

        <div class="btn-wrap">
          <button class="btn-continue" :disabled="authStore.loading" @click="submit">
            <i v-if="authStore.loading" class="pi pi-spin pi-spinner" />
            <span v-else>Continuar</span>
          </button>

          <template v-if="mode === 'admin'">
            <div class="divider"><span>o</span></div>

            <div ref="googleButtonContainer" class="google-btn-container"></div>
          </template>
        </div>

      </div>

      <div class="card-footer">
        <div class="footer-links">
          <span class="link-text">¿No tienes cuenta?</span>
          <span class="link-text link-highlight" @click="router.push('/register')">Regístrate!</span>
        </div>
        <span class="link-muted" @click="router.push('/forgot-password')">Olvidé mi contraseña</span>
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

.field-error {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #f87171;
  margin: -8px 0 0;
}

.mode-toggle {
  display: flex;
  gap: 6px;
  background: rgba(147, 193, 206, 0.08);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 4px;
}
.mode-btn {
  flex: 1;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: #93c1ce;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.mode-btn.active {
  background: #00c1b0;
  color: #04231f;
}
.client-hint {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #93c1ce;
  margin: -4px 0 0;
}

.form-success-top {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #4ade80;
  text-align: center;
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.btn-wrap {
  padding-top: 4px;
  padding-bottom: 1.27px;
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

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: rgba(147, 193, 206, 0.4);
  margin: 14px 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1.27px solid rgba(0, 193, 176, 0.1);
}
.divider:not(:empty)::before {
  margin-right: .5em;
}
.divider:not(:empty)::after {
  margin-left: .5em;
}

.btn-google {
  width: 100%;
  height: 41px;
  background: #03070a;
  border: 1.27px solid rgba(0, 193, 176, 0.25);
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #93c1ce;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.btn-google:hover:not(:disabled) {
  background: rgba(0, 193, 176, 0.05);
  border-color: rgba(0, 193, 176, 0.5);
  color: #ffffff;
}
.btn-google:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.google-btn-container {
  display: flex;
  justify-content: center;
  min-height: 44px;
}

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

.link-muted {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(147, 193, 206, 0.6);
  cursor: pointer;
}
.link-muted:hover { color: #93c1ce; }

.btn-patient {
  margin-top: 4px;
  background: transparent;
  border: 1px solid rgba(0, 193, 176, 0.3);
  border-radius: 8px;
  padding: 7px 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #00c1b0;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.btn-patient:hover { border-color: #00c1b0; background: rgba(0, 193, 176, 0.06); }

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
