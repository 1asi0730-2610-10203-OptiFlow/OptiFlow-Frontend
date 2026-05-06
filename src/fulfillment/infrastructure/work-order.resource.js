export class WorkOrderResource {
    constructor({order_id = 0, sale_id = 0, recipe_id = 0, lab_id = 0, status = 'PENDING', delivery_date = '', paciente = '', laboratorio = '', tipo = '', armazon = '', receta = '', prioridad = 'normal', adelanto = 0, total = 0, retrabajo = false} = {}) {
        this.order_id     = order_id
        this.sale_id      = sale_id
        this.recipe_id    = recipe_id
        this.lab_id       = lab_id
        this.status       = status
        this.delivery_date = delivery_date
        this.paciente     = paciente
        this.laboratorio  = laboratorio
        this.tipo         = tipo
        this.armazon      = armazon
        this.receta       = receta
        this.prioridad    = prioridad
        this.adelanto     = adelanto
        this.total        = total
        this.retrabajo    = retrabajo
    }
}