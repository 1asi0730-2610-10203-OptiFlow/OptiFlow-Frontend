import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class SupplierApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, import.meta.env.VITE_SUPPLIERS_ENDPOINT_PATH)
    }

    async getSuppliers()           { return await this.#endpoint.getAll() }
    async createSupplier(resource) { return await this.#endpoint.create(resource) }
}