export class ProductResource {
    constructor({product_id = 0, supplier_id = 0, brand = '', model = '',price = 0, stock = 0, name = '', category = '', sku = '', minimum_stock_threshold = 10, supplier_name = '', last_restock_date = ''} = {}) {
        this.product_id              = product_id
        this.supplier_id             = supplier_id
        this.brand                   = brand
        this.model                   = model
        this.price                   = price
        this.stock                   = stock
        this.name                    = name
        this.category                = category
        this.sku                     = sku
        this.minimum_stock_threshold = minimum_stock_threshold
        this.supplier_name           = supplier_name
        this.last_restock_date       = last_restock_date
    }
}