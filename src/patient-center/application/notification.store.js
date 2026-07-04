import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NotificationApi } from '../infrastructure/notification-api.js'
import { PatientApi } from '../infrastructure/patient-api.js'

const notificationApi = new NotificationApi()
const patientApi = new PatientApi()

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref([])
    const loading = ref(false)
    const patientId = ref(null)

    async function resolvePatientId(email) {
        if (patientId.value) return patientId.value
        const patient = await patientApi.getByEmail(email)
        if (patient) patientId.value = patient.id
        return patientId.value
    }

    async function fetchNotifications(email) {
        loading.value = true
        try {
            const id = await resolvePatientId(email)
            if (!id) { notifications.value = []; return }
            notifications.value = await notificationApi.getByPatientId(id)
        } catch (e) {
            console.error("Error cargando notificaciones:", e)
            notifications.value = []
        } finally {
            loading.value = false
        }
    }

    async function createNotification(email, resource) {
        try {
            const id = await resolvePatientId(email)
            if (!id) return
            const created = await notificationApi.create(id, resource)
            notifications.value.push(created)
        } catch (e) {
            console.error("Error creando notificación:", e)
        }
    }

    async function markAsRead(notificationId) {
        try {
            const id = patientId.value
            if (!id) return
            await notificationApi.markAsRead(id, notificationId)
            const notification = notifications.value.find(n => n.id === notificationId)
            if (notification) notification.status = 'READ'
        } catch (e) {
            console.error("Error marcando como leída:", e)
        }
    }

    return { notifications, loading, patientId, fetchNotifications, createNotification, markAsRead }
})