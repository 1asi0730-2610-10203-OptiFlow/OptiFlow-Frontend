import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class ProductApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, import.meta.env.VITE_PRODUCTS_ENDPOINT_PATH)
    }

    async getProducts()              { return await this.#endpoint.getAll() }
    async createProduct(resource)    { return await this.#endpoint.create(resource) }
    async updateProduct(p)           { return await this.#endpoint.update(p.product_id, p) }
    async deleteProduct(id)          { return await this.#endpoint.delete(id) }
}