import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PatientOrderApi } from '../infrastructure/patient-order-api.js'

const orderApi = new PatientOrderApi()

export const useOrderStore = defineStore('orders', () => {
    const patientOrders = ref([])
    const loading = ref(false)

    async function fetchAllPatientOrders(patientId) {
        loading.value = true
        try {
            patientOrders.value = await orderApi.getByPatientId(patientId)
        } catch (error) {
            console.error("Error fetching patient orders:", error)
            patientOrders.value = []
        } finally {
            loading.value = false
        }
    }

    return { patientOrders, loading, fetchAllPatientOrders }
})