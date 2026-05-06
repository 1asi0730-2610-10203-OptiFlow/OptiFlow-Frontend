export class WorkOrder {
    constructor({
                    id = 0,
                    saleId = 0,
                    recipeId = 0,
                    labId = 0,
                    status = 'PENDING',
                    deliveryDate = ''
                } = {}) {
        this.id = id
        this.saleId = saleId
        this.recipeId = recipeId
        this.labId = labId
        this.status = status
        this.deliveryDate = deliveryDate
    }
}

export const OrderStatus = Object.freeze({
    PENDING:         'PENDING',
    IN_PRODUCTION:   'IN_PRODUCTION',
    QUALITY_CONTROL: 'QUALITY_CONTROL',
    READY:           'READY',
    DELIVERED:       'DELIVERED'
})