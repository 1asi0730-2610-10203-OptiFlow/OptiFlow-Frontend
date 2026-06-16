import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class ClinicalRecordApi extends BaseApi {
    #endpoint
    #basePath

    constructor() {
        super()
        this.#basePath = import.meta.env.VITE_CLINICAL_RECORDS_ENDPOINT_PATH
        this.#endpoint = new BaseEndpoint(this.http, this.#basePath)
    }

    async getClinicalRecords()           { return await this.#endpoint.getAll() }

    // El backend usa /by-patient/{patientId} en lugar de query params
    async getByPatientId(patientId) {
        const response = await this.http.get(`${this.#basePath}/by-patient/${patientId}`)
        return response.data
    }

    async createClinicalRecord(resource) { return await this.#endpoint.create(resource) }
}