<template>
  <div class="profile-container p-4">
    <header class="profile-header mb-5">
      <h1 class="text-900 font-bold text-3xl mb-1 font-josefin">Mi Perfil</h1>
      <p class="text-500 text-sm">{{ authStore.currentUser?.email }}</p>
    </header>

    <div class="grid">
      <!-- Sección: Correo -->
      <div class="col-12 lg:col-6 mb-4">
        <pv-card class="shadow-none border-1 border-100 border-round-xl h-full" style="border: 1px solid #e2e8f0;">
          <template #title>
            <span class="text-900 font-bold text-xl font-josefin">Actualizar Correo</span>
          </template>
          <template #content>
            <form @submit.prevent="handleUpdateEmail" class="flex flex-column gap-4 mt-2">
              <div class="flex flex-column gap-2">
                <label for="newEmail" class="font-medium text-600 text-sm">Nuevo Correo Electrónico</label>
                <pv-input-text
                  id="newEmail"
                  v-model="emailForm.newEmail"
                  type="email"
                  placeholder="nuevo@correo.com"
                  required
                  class="w-full p-inputtext-sm"
                />
              </div>

              <pv-message v-if="emailMsg.error" severity="error" :closable="false">{{ emailMsg.error }}</pv-message>
              <pv-message v-if="emailMsg.success" severity="success" :closable="false">{{ emailMsg.success }}</pv-message>

              <pv-button
                type="submit"
                label="Actualizar Correo"
                :loading="authStore.loading"
                class="w-full mt-2"
                style="background-color: #00c1b0; border: none;"
              />
            </form>
          </template>
        </pv-card>
      </div>

      <!-- Sección: Contraseña -->
      <div class="col-12 lg:col-6 mb-4">
        <pv-card class="shadow-none border-1 border-100 border-round-xl h-full" style="border: 1px solid #e2e8f0;">
          <template #title>
            <span class="text-900 font-bold text-xl font-josefin">Actualizar Contraseña</span>
          </template>
          <template #content>
            <form @submit.prevent="handleUpdatePassword" class="flex flex-column gap-4 mt-2">
              <div class="flex flex-column gap-2">
                <label for="currentPassword" class="font-medium text-600 text-sm">Contraseña Actual</label>
                <pv-input-text
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  class="w-full p-inputtext-sm"
                />
              </div>

              <div class="flex flex-column gap-2">
                <label for="newPassword" class="font-medium text-600 text-sm">Nueva Contraseña</label>
                <pv-input-text
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  class="w-full p-inputtext-sm"
                />
              </div>

              <div class="flex flex-column gap-2">
                <label for="confirmNewPassword" class="font-medium text-600 text-sm">Confirmar Nueva Contraseña</label>
                <pv-input-text
                  id="confirmNewPassword"
                  v-model="passwordForm.confirmNewPassword"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  required
                  class="w-full p-inputtext-sm"
                />
              </div>

              <pv-message v-if="passwordMsg.error" severity="error" :closable="false">{{ passwordMsg.error }}</pv-message>
              <pv-message v-if="passwordMsg.success" severity="success" :closable="false">{{ passwordMsg.success }}</pv-message>

              <pv-button
                type="submit"
                label="Actualizar Contraseña"
                :loading="authStore.loading"
                class="w-full mt-2"
                style="background-color: #00c1b0; border: none;"
              />
            </form>
          </template>
        </pv-card>
      </div>
    </div>

    <div class="flex justify-content-end mt-4">
      <pv-button
        label="Cerrar Sesión"
        icon="pi pi-sign-out"
        class="p-button-danger p-button-outlined"
        @click="handleLogout"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../application/auth.store.js'

const authStore = useAuthStore()
const router = useRouter()

// Email form
const emailForm = reactive({ newEmail: '' })
const emailMsg = reactive({ error: null, success: null })

async function handleUpdateEmail() {
  emailMsg.error = null
  emailMsg.success = null
  const ok = await authStore.updateEmail(emailForm.newEmail)
  if (ok) {
    emailMsg.success = 'Correo actualizado. Tu sesión se ha renovado.'
    emailForm.newEmail = ''
  } else {
    emailMsg.error = authStore.error || 'Error al actualizar el correo.'
  }
}

// Password form
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
const passwordMsg = reactive({ error: null, success: null })

async function handleUpdatePassword() {
  passwordMsg.error = null
  passwordMsg.success = null

  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    passwordMsg.error = 'Las contraseñas nuevas no coinciden.'
    return
  }

  const ok = await authStore.updatePassword(
    passwordForm.currentPassword,
    passwordForm.newPassword
  )
  if (ok) {
    passwordMsg.success = 'Contraseña actualizada correctamente.'
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmNewPassword = ''
  } else {
    passwordMsg.error = authStore.error || 'Error al actualizar la contraseña.'
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}
.font-josefin {
  font-family: 'Josefin Sans', sans-serif;
}
</style>
