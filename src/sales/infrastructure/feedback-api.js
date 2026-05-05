import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class FeedbackApi extends BaseApi {
  #feedbacks

  constructor() {
    super()
    this.#feedbacks = new BaseEndpoint(this.http, import.meta.env.VITE_FEEDBACKS_ENDPOINT_PATH)
  }

  async createFeedback(resource) {
    return await this.#feedbacks.create(resource)
  }
}
