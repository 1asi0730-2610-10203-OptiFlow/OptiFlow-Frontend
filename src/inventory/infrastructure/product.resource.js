export class ProductResource {
    constructor({product_id = 0, category_id = 0, supplier_id = 0, brand = '', model = '', price = 0, stock = 0} = {}) {
        this.product_id = product_id
        this.category_id = category_id
        this.supplier_id = supplier_id
        this.brand = brand
        this.model = model
        this.price = price
        this.stock = stock
    }
}