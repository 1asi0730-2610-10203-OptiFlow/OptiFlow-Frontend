import { BaseApi } from '../../shared/infrastructure/base-api.js'

export class PatientOrderApi extends BaseApi {
    async getByPatientId(patientId) {
        const response = await this.http.get(
            `${import.meta.env.VITE_PATIENT_ORDERS_ENDPOINT_PATH}/${patientId}/orders`
        )
        return response.data
    }
}