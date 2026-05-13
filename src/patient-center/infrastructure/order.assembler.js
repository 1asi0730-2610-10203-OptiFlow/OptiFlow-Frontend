import { Order } from '../domain/model/order.entity.js'

export class OrderAssembler {
    static toEntityFromResource(resource) {
        return new Order({
            id:          resource.order_id,
            orderNumber: resource.order_number,
            status:      resource.status,
            productName: resource.product_name
        })
    }
}
