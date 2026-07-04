import { BaseApi } from '../../shared/infrastructure/base-api.js'

export class PatientApi extends BaseApi {
    async getAll() {
        const response = await this.http.get(
            import.meta.env.VITE_PATIENTS_ENDPOINT_PATH
        )
        return response.data
    }

    async getByEmail(email) {
        const all = await this.getAll()
        return all.find(p => p.email === email) || null
    }
}