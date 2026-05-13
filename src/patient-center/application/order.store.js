import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OrderAssembler } from '../infrastructure/order.assembler.js'

export const useOrderStore = defineStore('orders', () => {
    const currentOrder = ref(null)
    const patientOrders = ref([])
    const loading = ref(false)

    async function findOrder(number) {
        loading.value = true
        try {
            const apiUrl = import.meta.env.VITE_OPTIFLOW_API_URL || 'http://localhost:3000'
            const response = await fetch(`${apiUrl}/sales?labOrderNumber=${number}`)
            const sales = await response.json()
            
            let sale = sales[0]
            if (!sale) {
                // If not found by labOrderNumber, fallback to search by ID if it's a number
                const id = number.replace(/\D/g, '')
                if (id) {
                    const idRes = await fetch(`${apiUrl}/sales/${id}`)
                    if (idRes.ok) {
                        sale = await idRes.json()
                    }
                }
            }

            if (sale) {
                const woRes = await fetch(`${apiUrl}/workOrders?sale_id=${sale.id}`)
                const workOrders = await woRes.json()
                const workOrder = workOrders[0]

                currentOrder.value = {
                    orderNumber: sale.labOrderNumber || `LAB-${sale.id.toString().padStart(4, '0')}`,
                    productName: sale.articulos?.[0] || 'Lentes Progresivos',
                    status: workOrder ? workOrder.status : 'IN_PRODUCTION',
                    estimatedDate: workOrder ? workOrder.estimated_date : sale.createdAt,
                    createdAt: sale.createdAt,
                    totalAmount: sale.totalAmount,
                    paidAmount: sale.totalAmount - sale.pendingBalance,
                    pendingBalance: sale.pendingBalance
                }
            } else {
                currentOrder.value = null
            }
        } catch (error) {
            console.error("Error finding order:", error)
            currentOrder.value = null
        } finally {
            loading.value = false
        }
    }

    async function fetchAllPatientOrders() {
        loading.value = true
        try {
            const apiUrl = import.meta.env.VITE_OPTIFLOW_API_URL || 'http://localhost:3000'
            const response = await fetch(`${apiUrl}/sales?totalAmount_gt=0`)
            const sales = await response.json()
            
            const orders = []
            for (const sale of sales.slice(0, 5)) { // Limit to 5 for demo
                const woRes = await fetch(`${apiUrl}/workOrders?sale_id=${sale.id}`)
                const workOrders = await woRes.json()
                const workOrder = workOrders[0]

                orders.push({
                    id: sale.id,
                    orderNumber: sale.labOrderNumber || `LAB-${sale.id.toString().padStart(4, '0')}`,
                    productName: sale.articulos?.[0] || 'Lentes Progresivos',
                    status: workOrder ? workOrder.status : 'IN_PRODUCTION',
                    estimatedDate: workOrder ? workOrder.estimated_date : sale.createdAt,
                    createdAt: sale.createdAt,
                    totalAmount: sale.totalAmount,
                    paidAmount: sale.totalAmount - sale.pendingBalance,
                    pendingBalance: sale.pendingBalance
                })
            }
            patientOrders.value = orders
        } catch (error) {
            console.error("Error fetching patient orders:", error)
            patientOrders.value = []
        } finally {
            loading.value = false
        }
    }

    return { currentOrder, patientOrders, loading, findOrder, fetchAllPatientOrders }
})
