export class WorkOrder {
    constructor({id = '', saleId = 0, recipeId = 0, labId = 0, status = 'PENDING', deliveryDate = '', patientName = '', laboratoryName = '', lensType = '', frame = '', prescription = '', priority = 'normal', deposit = 0, total = 0, isRework = false} = {}) {
        this.id = id
        this.saleId = saleId
        this.recipeId = recipeId
        this.labId = labId
        this.status = status
        this.deliveryDate = deliveryDate
        this.patientName = patientName
        this.laboratoryName = laboratoryName
        this.lensType = lensType
        this.frame = frame
        this.prescription = prescription
        this.priority = priority
        this.deposit = deposit
        this.total = total
        this.isRework = isRework
    }
}

export const OrderStatus = Object.freeze({
    PENDING:         'PENDING',
    IN_PRODUCTION:   'IN_PRODUCTION',
    QUALITY_CONTROL: 'QUALITY_CONTROL',
    READY:           'READY',
    DELIVERED:       'DELIVERED'
})

export const OrderPriority = Object.freeze({
    URGENT: 'urgent',
    HIGH:   'high',
    NORMAL: 'normal'
})