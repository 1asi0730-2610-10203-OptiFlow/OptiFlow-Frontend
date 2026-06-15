import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class PaymentApi extends BaseApi {
  #payments

  constructor() {
    super()
    this.#payments = new BaseEndpoint(this.http, import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH)
  }

  async getPaymentsBySaleId(saleId) {
    return await this.#payments.getAllByParam('saleId', saleId)
  }

  async registerPayment(resource) {
    return await this.#payments.create(resource)
  }

  async payOutstandingBalance(saleId, resource){
      const response = await this.http.post(
          `${this.#payments}/${saleId}/pay`, resource
      )

      return response.data;
  }
}
