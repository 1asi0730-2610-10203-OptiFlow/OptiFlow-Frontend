export class Order {
    constructor({ id = 0, orderNumber = '', status = '', productName = '' } = {}) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.status = status;
        this.productName = productName;
    }
}
