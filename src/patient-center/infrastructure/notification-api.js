import { BaseApi } from '../../shared/infrastructure/base-api.js'

export class NotificationApi extends BaseApi {
    async getByPatientId(patientId) {
        const response = await this.http.get(
            `${import.meta.env.VITE_PATIENT_NOTIFICATIONS_ENDPOINT_PATH}/${patientId}/notifications`
        )
        return response.data
    }

    async create(patientId, resource) {
        const response = await this.http.post(
            `${import.meta.env.VITE_PATIENT_NOTIFICATIONS_ENDPOINT_PATH}/${patientId}/notifications`,
            resource
        )
        return response.data
    }

    async markAsRead(patientId, notificationId) {
        const response = await this.http.patch(
            `${import.meta.env.VITE_PATIENT_NOTIFICATIONS_ENDPOINT_PATH}/${patientId}/notifications/${notificationId}/read`
        )
        return response.data
    }
}