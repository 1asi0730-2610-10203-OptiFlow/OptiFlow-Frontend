import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class ReportApi extends BaseApi {
  #reports

  constructor() {
    super()
    this.#reports = new BaseEndpoint(this.http, import.meta.env.VITE_REPORTS_ENDPOINT_PATH || '/reports')
  }

  async getAll() {
    return await this.#reports.getAll()
  }

  async getById(id) {
    return await this.#reports.getById(id)
  }
}