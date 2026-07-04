import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { IamApi } from '../infrastructure/iam-api.js'
import { UserAssembler } from '../infrastructure/user.assembler.js'

const iamApi = new IamApi()

export const useAuthStore = defineStore('auth', () => {
  // ─── State ─────────────────────────────────────────────────────────────────
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // ─── Getters ────────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)

  // ─── Helpers ────────────────────────────────────────────────────────────────
  function _persistSession(userData, jwtToken) {
    user.value = userData
    token.value = jwtToken
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', jwtToken)
  }

  function clearError() {
    error.value = null
  }

  // localStorage is shared across every tab of the same browser. Without this,
  // logging in as a different user in another tab silently overwrites this
  // tab's session in storage while its in-memory state (and UI) keeps showing
  // the old user — so this tab would still LOOK logged in as user A while every
  // request it sends is actually authenticated as user B. Syncing on the native
  // `storage` event (which only fires in tabs OTHER than the one that wrote the
  // change) keeps every tab's session state truthful.
  window.addEventListener('storage', (event) => {
    if (event.key !== 'token' && event.key !== 'user') return
    token.value = localStorage.getItem('token') || null
    user.value = JSON.parse(localStorage.getItem('user') || 'null')
  })

  // ─── Actions ────────────────────────────────────────────────────────────────

  /**
   * Login con email + contraseña
   */
  async function signIn(email, password) {
    loading.value = true
    error.value = null
    try {
      const data = await iamApi.signIn(email, password)
      // data = { id, email, token }
      const userEntity = UserAssembler.toEntity({ id: data.id, email: data.email })
      _persistSession(userEntity, data.token)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Registro de nuevo usuario
   */
  async function signUp(email, password) {
    loading.value = true
    error.value = null
    try {
      await iamApi.signUp(email, password)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Login con Google
   * @param {string} idToken — token de Google OAuth
   */
  async function googleSignIn(idToken) {
    loading.value = true
    error.value = null
    try {
      const data = await iamApi.googleSignIn(idToken)
      const userEntity = UserAssembler.toEntity({ id: data.id, email: data.email })
      _persistSession(userEntity, data.token)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Solicitar token de recuperación de contraseña
   */
  async function forgotPassword(email) {
    loading.value = true
    error.value = null
    try {
      await iamApi.forgotPassword(email)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Resetear contraseña con token recibido por email
   */
  async function resetPassword(recoveryToken, newPassword) {
    loading.value = true
    error.value = null
    try {
      await iamApi.resetPassword(recoveryToken, newPassword)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar email (requiere estar autenticado)
   */
  async function updateEmail(newEmail) {
    if (!user.value) return false
    loading.value = true
    error.value = null
    try {
      const data = await iamApi.updateUserEmail(user.value.id, newEmail)
      const userEntity = UserAssembler.toEntity({ id: data.id, email: data.email })
      _persistSession(userEntity, data.token)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar contraseña (requiere estar autenticado)
   */
  async function updatePassword(currentPassword, newPassword) {
    if (!user.value) return false
    loading.value = true
    error.value = null
    try {
      await iamApi.updateUserPassword(user.value.id, currentPassword, newPassword)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Cerrar sesión
   */
  function logout() {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return {
    // state
    user,
    token,
    loading,
    error,
    // getters
    isAuthenticated,
    currentUser,
    // actions
    signIn,
    signUp,
    googleSignIn,
    forgotPassword,
    resetPassword,
    updateEmail,
    updatePassword,
    logout,
    clearError,
  }
})
