import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class ClinicalRecordApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, import.meta.env.VITE_CLINICAL_RECORDS_ENDPOINT_PATH)
    }

    async getClinicalRecords()                    { return await this.#endpoint.getAll() }
    async getByPatientId(patientId)               { return await this.#endpoint.getAllByParam('patient_id', patientId) }
    async createClinicalRecord(resource)          { return await this.#endpoint.create(resource) }
}
