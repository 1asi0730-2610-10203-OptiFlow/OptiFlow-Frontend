import { BaseApi } from '../../shared/infrastructure/base-api.js'

export class SubscriptionApi extends BaseApi {
  constructor() {
    super()
  }

  /** Obtiene todos los planes disponibles. */
  async getPlans() {
    const response = await this.http.get('/api/v1/plans')
    return response.data
  }

  /** Estado de la suscripción de la cuenta actual: { hasActiveSubscription, status, subscription }. */
  async getMySubscription() {
    const response = await this.http.get('/api/v1/subscriptions/me')
    return response.data
  }

  /** Confirma el pago tras volver de Stripe y activa la suscripción. Devuelve { active }. */
  async confirmCheckout(sessionId) {
    const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''
    const response = await this.http.post(`/api/v1/checkout/confirm${query}`)
    return response.data
  }

  /**
   * Crea una Stripe Checkout Session para el plan elegido.
   * El backend obtiene el usuario desde el JWT, no hace falta enviarlo.
   */
  async createCheckoutSession(planId, planName, amount) {
    const response = await this.http.post('/api/v1/checkout', {
      planId,
      planName,
      amount
    })
    return response.data // { checkoutUrl }
  }
}
