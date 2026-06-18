export class WorkOrderResource {
    constructor({
                    saleId = 0, recipeId = 0, laboratoryId = 0,
                    status = 'PENDING', deliveryDate = '',
                    patientName = '', laboratoryName = '',
                    lensType = '', frame = '', prescription = '',
                    priority = 'normal', deposit = 0, total = 0, isRework = false
                } = {}) {
        this.saleId         = saleId
        this.recipeId       = recipeId
        this.laboratoryId   = laboratoryId
        this.status         = status
        this.deliveryDate   = deliveryDate
        this.patientName    = patientName
        this.laboratoryName = laboratoryName
        this.lensType       = lensType
        this.frame          = frame
        this.prescription   = prescription
        this.priority       = priority
        this.deposit        = deposit
        this.total          = total
        this.isRework       = isRework
    }
}