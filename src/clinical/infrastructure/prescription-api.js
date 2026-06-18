import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class PrescriptionApi extends BaseApi {
    #endpoint
    #basePath

    constructor() {
        super()
        this.#basePath = import.meta.env.VITE_PRESCRIPTIONS_ENDPOINT_PATH
        this.#endpoint = new BaseEndpoint(this.http, this.#basePath)
    }

    async getPrescriptions()                   { return await this.#endpoint.getAll() }

    // El backend usa /by-clinical-record/{recordId} en lugar de query params
    async getPrescriptionsByRecordId(recordId) {
        const response = await this.http.get(`${this.#basePath}/by-clinical-record/${recordId}`)
        return response.data
    }

    async createPrescription(resource)         { return await this.#endpoint.create(resource) }
}