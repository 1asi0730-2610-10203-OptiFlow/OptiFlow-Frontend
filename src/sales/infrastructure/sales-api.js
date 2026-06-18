import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class SalesApi extends BaseApi {
  #sales
  #saleDetails

  constructor() {
    super()
    this.#sales = new BaseEndpoint(this.http, import.meta.env.VITE_SALES_ENDPOINT_PATH)
    this.#saleDetails = new BaseEndpoint(this.http, import.meta.env.VITE_SALE_DETAILS_ENDPOINT_PATH)
  }

  async getSales() {
    return await this.#sales.getAll()
  }

  async getSaleById(id) {
    return await this.#sales.getById(id)
  }

  async createSale(resource) {
    return await this.#sales.create(resource)
  }

  async updateSale(id, resource) {
    return await this.#sales.update(id, resource)
  }

  async getSaleDetailsBySaleId(saleId) {
    return await this.#saleDetails.getAllByParam('saleId', saleId)
  }

  async cancelSale(id, labOrderStatus) {
    const res = await this.http.post(`${import.meta.env.VITE_SALES_ENDPOINT_PATH}/${id}/cancel`, { labOrderStatus })
    return res.data
  }
}
