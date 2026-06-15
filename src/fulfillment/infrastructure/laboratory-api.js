import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class LaboratoryApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, import.meta.env.VITE_LABORATORIES_ENDPOINT_PATH)
    }

    async getLaboratories() {
        return await this.#endpoint.getAll()
    }

    async createLaboratory(resource) {
        return await this.#endpoint.create(resource)
    }
}