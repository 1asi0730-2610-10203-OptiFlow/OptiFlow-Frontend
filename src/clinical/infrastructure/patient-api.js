import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class PatientApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, import.meta.env.VITE_PATIENTS_ENDPOINT_PATH)
    }

    async getPatients()            { return await this.#endpoint.getAll() }
    async getPatientById(id)       { return await this.#endpoint.getById(id) }
    async createPatient(resource)  { return await this.#endpoint.create(resource) }
    async updatePatient(resource)  { return await this.#endpoint.update(resource.patient_id, resource) }
    async deletePatient(id)        { return await this.#endpoint.delete(id) }
}
