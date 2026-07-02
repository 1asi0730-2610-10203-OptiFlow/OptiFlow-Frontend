import { WorkOrder } from '../domain/model/work-order.entity.js'
import { WorkOrderResource } from './work-order.resource.js'

export class WorkOrderAssembler {
    static toEntityFromResource(resource) {
        return new WorkOrder({
            id:             resource.id,
            saleId:         resource.saleId,
            recipeId:       resource.recipeId,
            laboratoryId:   resource.laboratoryId,
            status:         resource.status,
            deliveryDate:   resource.deliveryDate ?? '',
            patientName:    resource.patientName ?? '',
            laboratoryName: resource.laboratoryName ?? '',
            lensType:       resource.lensType ?? '',
            lensProductId:  resource.lensProductId ?? null,
            frame:          resource.frame ?? '',
            frameProductId: resource.frameProductId ?? null,
            prescription:   resource.prescription ?? '',
            priority:       (resource.priority ?? 'normal').toLowerCase(),
            deposit:        resource.deposit ?? 0,
            total:          resource.total ?? 0,
            isRework:       resource.isRework ?? false
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(resource => WorkOrderAssembler.toEntityFromResource(resource))
    }

    static toResourceFromEntity(workOrder) {
        return new WorkOrderResource({
            saleId:         workOrder.saleId,
            recipeId:       workOrder.recipeId,
            laboratoryId:   workOrder.labId,
            status:         workOrder.status,
            deliveryDate:   workOrder.deliveryDate,
            patientName:    workOrder.patientName,
            laboratoryName: workOrder.laboratoryName,
            lensType:       workOrder.lensType,
            lensProductId:  workOrder.lensProductId,
            frame:          workOrder.frame,
            frameProductId: workOrder.frameProductId,
            prescription:   workOrder.prescription,
            priority:       workOrder.priority,
            deposit:        workOrder.deposit,
            total:          workOrder.total,
            isRework:       workOrder.isRework
        })
    }
}