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
