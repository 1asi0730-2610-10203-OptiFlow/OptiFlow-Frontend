<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../application/auth.store.js'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email    = ref('')
const password = ref('')
const showSuccessMsg = ref(false)

onMounted(() => {
  authStore.clearError()
  if (route.query.registered === 'true') {
    showSuccessMsg.value = true
  }
})

async function submit() {
  if (!email.value || !password.value) return
  showSuccessMsg.value = false
  const ok = await authStore.signIn(email.value, password.value)
  if (ok) {
    const userRole = localStorage.getItem(`role_${email.value}`) || (email.value.includes('patient') || email.value.includes('paciente') ? 'Paciente' : 'Administrador')
    const redirectPath = userRole === 'Paciente' ? '/patient/my-lenses' : '/panel'
    router.push(redirectPath)
  }
}

function handleGoogleSignIn() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    authStore.error = 'Google Sign-In no configurado.'
    return
  }
  if (!window.google) {
    authStore.error = 'El script de Google no está cargado. Verifica tu conexión.'
    return
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async ({ credential }) => {
      const ok = await authStore.googleSignIn(credential)
      if (ok) {
        const userEmail = authStore.currentUser?.email || ''
        const userRole = localStorage.getItem(`role_${userEmail}`) || (userEmail.includes('patient') || userEmail.includes('paciente') ? 'Paciente' : 'Administrador')
        const redirectPath = userRole === 'Paciente' ? '/patient/my-lenses' : '/panel'
        router.push(redirectPath)
      }
    },
  })
  window.google.accounts.id.prompt()
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

        <div v-if="showSuccessMsg" class="form-success-top">
          Registro exitoso.<br />Inicia sesión
        </div>

        <div class="field">
          <label class="field-label">Email</label>
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

        <div class="field">
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

        <p v-if="authStore.error" class="field-error">{{ authStore.error }}</p>

        <div class="btn-wrap">
          <button class="btn-continue" :disabled="authStore.loading" @click="submit">
            <i v-if="authStore.loading" class="pi pi-spin pi-spinner" />
            <span v-else>Continuar</span>
          </button>

          <div class="divider"><span>o</span></div>

          <button class="btn-google" :disabled="authStore.loading" @click="handleGoogleSignIn">
            <img src="https://www.google.com/favicon.ico" alt="Google" width="16" />
            <span>Continuar con Google</span>
          </button>
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
