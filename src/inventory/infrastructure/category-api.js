import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class CategoryApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH)
    }

    async getCategories() { return await this.#endpoint.getAll() }
}