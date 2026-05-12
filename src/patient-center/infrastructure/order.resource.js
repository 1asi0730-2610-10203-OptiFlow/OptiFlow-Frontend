export class OrderResource {
    constructor({
        order_id = 0,
        order_number = '',
        status = '',
        product_name = '',
        delivery_date = ''
    } = {}) {
        this.order_id = order_id
        this.order_number = order_number
        this.status = status
        this.product_name = product_name
        this.delivery_date = delivery_date
    }
}
