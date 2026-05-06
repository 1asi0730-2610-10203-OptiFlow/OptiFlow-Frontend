import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { WorkOrderApi } from '../infrastructure/work-order-api.js'
import { LaboratoryApi } from '../infrastructure/laboratory-api.js'
import { WorkOrderAssembler } from '../infrastructure/work-order.assembler.js'
import { LaboratoryAssembler } from '../infrastructure/laboratory.assembler.js'
import { OrderStatus } from '../domain/model/work-order.entity.js'

const workOrderApi = new WorkOrderApi()
const laboratoryApi = new LaboratoryApi()

export const useFulfillmentStore = defineStore('fulfillment', () => {
    const workOrdersRef = ref([])
    const laboratoriesRef = ref([])
    const loading = ref(false)
    const errors = ref([])

    const workOrders = computed(() => workOrdersRef.value)
    const laboratories = computed(() => laboratoriesRef.value)
    const pendingOrders = computed(() =>
        workOrdersRef.value.filter(wo => wo.status !== OrderStatus.DELIVERED)
    )

    async function loadWorkOrders() {
        loading.value = true
        try {
            const resources = await workOrderApi.getWorkOrders()
            workOrdersRef.value = WorkOrderAssembler.toEntitiesFromResponse(resources)
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function loadLaboratories() {
        loading.value = true
        try {
            const resources = await laboratoryApi.getLaboratories()
            laboratoriesRef.value = LaboratoryAssembler.toEntitiesFromResponse(resources)
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function createWorkOrder(wo) {
        loading.value = true
        try {
            const resource = WorkOrderAssembler.toResourceFromEntity(wo)
            const created = await workOrderApi.createWorkOrder(resource)
            workOrdersRef.value.unshift(WorkOrderAssembler.toEntityFromResource(created))
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function updateOrderStatus(id, status) {
        loading.value = true
        try {
            const updated = await workOrderApi.updateOrderStatus(id, status)
            const entity = WorkOrderAssembler.toEntityFromResource(updated)
            const index = workOrdersRef.value.findIndex(wo => wo.id === id)
            if (index !== -1) workOrdersRef.value[index] = entity
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    return {
        workOrders, laboratories, pendingOrders,
        loadWorkOrders, loadLaboratories,
        createWorkOrder, updateOrderStatus
    }
})