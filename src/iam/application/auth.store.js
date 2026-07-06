import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { IamApi } from '../infrastructure/iam-api.js'
import { UserAssembler } from '../infrastructure/user.assembler.js'
import { SubscriptionApi } from '../../subscription/infrastructure/subscription-api.js'

const iamApi = new IamApi()
const subscriptionApi = new SubscriptionApi()

export const useAuthStore = defineStore('auth', () => {
  // ─── State ─────────────────────────────────────────────────────────────────
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  // null = unknown (needs a refresh), true/false = last known account subscription state.
  const subscriptionActive = ref(JSON.parse(localStorage.getItem('subscriptionActive') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  // ─── Getters ────────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)
  const isClient = computed(() => user.value?.role === 'CLIENT')

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

  function setSubscriptionActive(value) {
    subscriptionActive.value = value
    localStorage.setItem('subscriptionActive', JSON.stringify(value))
  }

  /** Re-reads the current account's subscription state from the backend. */
  async function refreshSubscription() {
    if (!token.value) return false
    try {
      const status = await subscriptionApi.getMySubscription()
      setSubscriptionActive(!!status?.hasActiveSubscription)
    } catch {
      setSubscriptionActive(false)
    }
    return subscriptionActive.value
  }

  // localStorage is shared across every tab of the same browser. Without this,
  // logging in as a different user in another tab silently overwrites this
  // tab's session in storage while its in-memory state (and UI) keeps showing
  // the old user — so this tab would still LOOK logged in as user A while every
  // request it sends is actually authenticated as user B. Syncing on the native
  // `storage` event (which only fires in tabs OTHER than the one that wrote the
  // change) keeps every tab's session state truthful.
  window.addEventListener('storage', (event) => {
    if (event.key !== 'token' && event.key !== 'user' && event.key !== 'subscriptionActive') return
    token.value = localStorage.getItem('token') || null
    user.value = JSON.parse(localStorage.getItem('user') || 'null')
    subscriptionActive.value = JSON.parse(localStorage.getItem('subscriptionActive') || 'null')
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
      // data = { id, email, token, accountId, role }
      const userEntity = UserAssembler.toEntity(data)
      _persistSession(userEntity, data.token)
      setSubscriptionActive(null) // unknown until refreshed
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
  async function signUp(email, password, userType) {
    loading.value = true
    error.value = null
    try {
      await iamApi.signUp(email, password, userType)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra un administrador y deja la sesión iniciada para poder crear el checkout de Stripe
   * inmediatamente (a diferencia de signUp, que no autentica). La cuenta queda sin suscripción hasta pagar.
   */
  async function signUpAdminForCheckout(email, password) {
    loading.value = true
    error.value = null
    try {
      const data = await iamApi.signUp(email, password, 'admin')
      const userEntity = UserAssembler.toEntity(data)
      _persistSession(userEntity, data.token)
      setSubscriptionActive(false)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Login de cliente (paciente) solo con nombre de usuario (email), sin contraseña.
   */
  async function clientSignIn(username) {
    loading.value = true
    error.value = null
    try {
      const data = await iamApi.clientSignIn(username)
      const userEntity = UserAssembler.toEntity(data)
      _persistSession(userEntity, data.token)
      setSubscriptionActive(null)
      return true
    } catch (err) {
      error.value = err.response?.data?.error || err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.message
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
      const userEntity = UserAssembler.toEntity(data)
      _persistSession(userEntity, data.token)
      setSubscriptionActive(null)
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
      const userEntity = UserAssembler.toEntity(data)
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
    subscriptionActive.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('subscriptionActive')
  }

  return {
    // state
    user,
    token,
    subscriptionActive,
    loading,
    error,
    // getters
    isAuthenticated,
    currentUser,
    isClient,
    // actions
    refreshSubscription,
    setSubscriptionActive,
    signIn,
    clientSignIn,
    signUp,
    signUpAdminForCheckout,
    googleSignIn,
    forgotPassword,
    resetPassword,
    updateEmail,
    updatePassword,
    logout,
    clearError,
  }
})
