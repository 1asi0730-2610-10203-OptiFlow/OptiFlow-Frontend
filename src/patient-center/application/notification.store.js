import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NotificationApi } from '../infrastructure/notification-api.js'

const notificationApi = new NotificationApi()

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref([])
    const loading = ref(false)

    async function fetchNotifications(patientId) {
        loading.value = true
        try {
            notifications.value = await notificationApi.getByPatientId(patientId)
        } catch (e) {
            console.error("Error cargando notificaciones:", e)
            notifications.value = []
        } finally {
            loading.value = false
        }
    }

    async function createNotification(patientId, resource) {
        try {
            const created = await notificationApi.create(patientId, resource)
            notifications.value.push(created)
        } catch (e) {
            console.error("Error creando notificación:", e)
        }
    }

    async function markAsRead(patientId, notificationId) {
        try {
            await notificationApi.markAsRead(patientId, notificationId)
            const notification = notifications.value.find(n => n.id === notificationId)
            if (notification) notification.status = 'READ'
        } catch (e) {
            console.error("Error marcando como leída:", e)
        }
    }

    return { notifications, loading, fetchNotifications, createNotification, markAsRead }
})