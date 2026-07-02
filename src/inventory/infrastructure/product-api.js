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
    async updateProduct(id, payload) { return await this.#endpoint.update(id, payload) }
    async deleteProduct(id)          { return await this.#endpoint.delete(id) }

    async restockProduct(id, quantity, author) {
        const response = await this.http.post(
            `${import.meta.env.VITE_PRODUCTS_ENDPOINT_PATH}/${id}/restock`,
            { quantity, author }
        )
        return response.data
    }
}