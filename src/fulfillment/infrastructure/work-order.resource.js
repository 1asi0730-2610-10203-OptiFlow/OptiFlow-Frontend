export class WorkOrderResource {
    constructor({order_id = '', sale_id = 0, recipe_id = 0, lab_id = 0, status = 'PENDING', delivery_date = '', patient_name = '', laboratory_name = '', lens_type = '', frame = '', prescription = '', priority = 'normal', deposit = 0, total = 0, is_rework = false} = {}) {
        this.order_id       = order_id
        this.sale_id        = sale_id
        this.recipe_id      = recipe_id
        this.lab_id         = lab_id
        this.status         = status
        this.delivery_date  = delivery_date
        this.patient_name   = patient_name
        this.laboratory_name = laboratory_name
        this.lens_type      = lens_type
        this.frame          = frame
        this.prescription   = prescription
        this.priority       = priority
        this.deposit        = deposit
        this.total          = total
        this.is_rework      = is_rework
    }
}