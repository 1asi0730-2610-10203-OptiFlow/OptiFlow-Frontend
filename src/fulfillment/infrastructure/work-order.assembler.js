import { WorkOrder } from '../domain/model/work-order.entity.js'
import { WorkOrderResource } from './work-order.resource.js'

export class WorkOrderAssembler {
    static toEntityFromResource(r) {
        const workOrder = new WorkOrder({
            id: r.order_id,
            saleId: r.sale_id,
            recipeId: r.recipe_id,
            labId: r.lab_id,
            status: r.status,
            deliveryDate: r.delivery_date ?? ''
        })
        workOrder.paciente    = r.paciente    ?? ''
        workOrder.laboratorio = r.laboratorio ?? ''
        workOrder.tipo        = r.tipo        ?? ''
        workOrder.armazon     = r.armazon     ?? ''
        workOrder.receta      = r.receta      ?? ''
        workOrder.prioridad   = r.prioridad   ?? 'normal'
        workOrder.adelanto    = r.adelanto    ?? 0
        workOrder.toworkOrdertal       = r.total       ?? 0
        workOrder.retrabajo   = r.retrabajo   ?? false
        return workOrder
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => WorkOrderAssembler.toEntityFromResource(r))
    }

    static toResourceFromEntity(workOrder) {
        return new WorkOrderResource({
            order_id:      workOrder.id,
            sale_id:       workOrder.saleId,
            recipe_id:     workOrder.recipeId,
            lab_id:        workOrder.labId,
            status:        workOrder.status,
            delivery_date: workOrder.deliveryDate,
            paciente:      workOrder.paciente,
            laboratorio:   workOrder.laboratorio,
            tipo:          workOrder.tipo,
            armazon:       workOrder.armazon,
            receta:        workOrder.receta,
            prioridad:     workOrder.prioridad,
            adelanto:      workOrder.adelanto,
            total:         workOrder.total,
            retrabajo:     workOrder.retrabajo
        })
    }
}