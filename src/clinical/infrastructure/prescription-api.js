import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class PrescriptionApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, import.meta.env.VITE_PRESCRIPTIONS_ENDPOINT_PATH)
    }

    async getPrescriptions()                       { return await this.#endpoint.getAll() }
    async getPrescriptionsByRecordId(recordId)     { return await this.#endpoint.getAllByParam('clinical_record_id', recordId) }
    async createPrescription(resource)             { return await this.#endpoint.create(resource) }
}
