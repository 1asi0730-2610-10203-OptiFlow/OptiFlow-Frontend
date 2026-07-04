import { BaseApi } from '../../shared/infrastructure/base-api.js'

export class PatientApi extends BaseApi {
    async getByEmail(email) {
        const response = await this.http.get(
            `/api/v1/patient-center/patients/by-email`,
            { params: { email } }
        )
        return response.data
    }
}