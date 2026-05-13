import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OrderAssembler } from '../infrastructure/order.assembler.js'

export const useOrderStore = defineStore('orders', () => {
    const currentOrder = ref(null)
    const loading = ref(false)

    async function findOrder(number) {
        loading.value = true
        await new Promise(resolve => setTimeout(resolve, 500))

        if (number.trim() !== "") {
            const mockResource = {
                order_id: 1,
                order_number: number.toUpperCase(),
                status: 'En Control de Calidad',
                product_name: 'Lentes Progresivos'
            }
            currentOrder.value = OrderAssembler.toEntityFromResource(mockResource)
        } else {
            currentOrder.value = null
        }
        loading.value = false
    }

    return { currentOrder, loading, findOrder }
})
