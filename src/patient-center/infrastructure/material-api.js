import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class MaterialApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, import.meta.env.VITE_LENS_MATERIALS_ENDPOINT_PATH)
    }

    async getMaterials() {
        return await this.#endpoint.getAll()
    }
}