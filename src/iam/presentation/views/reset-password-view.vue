<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../application/auth.store.js'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const token = ref(route.query.token || '')
const form = reactive({ password: '', confirmPassword: '' })
const localError = ref(null)
const successMsg = ref(null)

onMounted(() => authStore.clearError())

async function handleSubmit() {
  localError.value = null
  successMsg.value = null

  if (form.password !== form.confirmPassword) {
    localError.value = 'Las contraseñas no coinciden.'
    return
  }
  if (form.password.length < 8) {
    localError.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }

  const ok = await authStore.resetPassword(token.value, form.password)
  if (ok) {
    successMsg.value = 'Contraseña restablecida con éxito. Redirigiendo...'
    setTimeout(() => router.push('/login'), 2000)
  }
}
</script>

<template>
  <div class="login-page">

    <div class="login-brand">
      <span class="brand-name">OptiFlow</span>
      <span class="brand-sub">ERP / CRM Óptico</span>
    </div>

    <h1 class="login-title">Nueva Contraseña</h1>

    <div class="login-card">

      <form @submit.prevent="handleSubmit" class="card-fields" novalidate>

        <div class="field">
          <label class="field-label">Nueva Contraseña</label>
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
                placeholder="Repite la contraseña"
                required
            />
          </div>
        </div>

        <p v-if="localError" class="field-error">{{ localError }}</p>
        <p v-if="authStore.error" class="field-error">{{ authStore.error }}</p>
        <p v-if="successMsg" class="field-success">{{ successMsg }}</p>
        <p v-if="!token" class="field-error">
          El enlace es inválido o ha expirado. Solicita uno nuevo.
        </p>

        <div class="btn-wrap">
          <button
              type="submit"
              class="btn-continue"
              :disabled="authStore.loading || !token || !!successMsg"
          >
            <i v-if="authStore.loading" class="pi pi-spin pi-spinner" />
            <span v-else>Restablecer contraseña</span>
          </button>
        </div>

      </form>

      <div class="card-footer">
        <span class="link-muted" @click="router.push('/login')">Volver al login</span>
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

.field-success {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #00c1b0;
  margin: -8px 0 0;
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
  padding: 20px 25px;
}

.link-muted {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(147, 193, 206, 0.6);
  cursor: pointer;
}
.link-muted:hover { color: #93c1ce; }

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
