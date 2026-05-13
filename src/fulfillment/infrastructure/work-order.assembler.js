import { WorkOrder } from '../domain/model/work-order.entity.js'
import { WorkOrderResource } from './work-order.resource.js'

export class WorkOrderAssembler {
    static toEntityFromResource(resource) {
        return new WorkOrder({
            id:              resource.id ?? resource.order_id,
            saleId:          resource.sale_id,
            recipeId:        resource.recipe_id,
            labId:           resource.lab_id,
            status:          resource.status,
            deliveryDate:    resource.delivery_date    ?? '',
            patientName:     resource.patient_name     ?? '',
            laboratoryName:  resource.laboratory_name  ?? '',
            lensType:        resource.lens_type        ?? '',
            frame:           resource.frame            ?? '',
            prescription:    resource.prescription     ?? '',
            priority:        resource.priority         ?? 'normal',
            deposit:         resource.deposit          ?? 0,
            total:           resource.total            ?? 0,
            isRework:        resource.is_rework        ?? false
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(resource => WorkOrderAssembler.toEntityFromResource(resource))
    }

    static toResourceFromEntity(workOrder) {
        return new WorkOrderResource({
            order_id:        workOrder.id,
            sale_id:         workOrder.saleId,
            recipe_id:       workOrder.recipeId,
            lab_id:          workOrder.labId,
            status:          workOrder.status,
            delivery_date:   workOrder.deliveryDate,
            patient_name:    workOrder.patientName,
            laboratory_name: workOrder.laboratoryName,
            lens_type:       workOrder.lensType,
            frame:           workOrder.frame,
            prescription:    workOrder.prescription,
            priority:        workOrder.priority,
            deposit:         workOrder.deposit,
            total:           workOrder.total,
            is_rework:       workOrder.isRework
        })
    }
}