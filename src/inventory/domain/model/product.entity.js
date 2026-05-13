export class Product {
    constructor({id = 0, categoryId = 0, supplierId = 0,brand = '', model = '', price = 0, stock = 0, name = '', category = '', sku = '', minimumStockThreshold = 10, supplierName = '', lastRestockDate = ''} = {}) {
        this.id = id
        this.categoryId = categoryId
        this.supplierId = supplierId
        this.brand = brand
        this.model = model
        this.price = price
        this.stock = stock
        this.name = name
        this.category = category
        this.sku = sku
        this.minimumStockThreshold = minimumStockThreshold
        this.supplierName = supplierName
        this.lastRestockDate = lastRestockDate
    }
}