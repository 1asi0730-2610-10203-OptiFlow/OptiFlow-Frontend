import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PatientOrderApi } from '../infrastructure/patient-order-api.js'
import { PatientApi } from '../infrastructure/patient-api.js'

const orderApi = new PatientOrderApi()
const patientApi = new PatientApi()

export const useOrderStore = defineStore('orders', () => {
    const patientOrders = ref([])
    const loading = ref(false)
    const patientId = ref(null)

    async function resolvePatientId(email) {
        if (patientId.value) return patientId.value
        const patient = await patientApi.getByEmail(email)
        if (patient) patientId.value = patient.id
        return patientId.value
    }

    async function fetchAllPatientOrders(email) {
        loading.value = true
        try {
            const id = await resolvePatientId(email)
            if (!id) { patientOrders.value = []; return }
            patientOrders.value = await orderApi.getByPatientId(id)
        } catch (error) {
            console.error("Error fetching patient orders:", error)
            patientOrders.value = []
        } finally {
            loading.value = false
        }
    }

    return { patientOrders, loading, patientId, fetchAllPatientOrders }
})