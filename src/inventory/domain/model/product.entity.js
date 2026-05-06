export class Product {
    constructor({
                    id = 0,
                    categoryId = 0,
                    supplierId = 0,
                    brand = '',
                    model = '',
                    price = 0,
                    stock = 0,
                    nombre = '',
                    categoria = '',
                    sku = '',
                    nivelReorden = 10,
                    proveedor = '',
                    ultimoRestock = ''
                } = {}) {
        this.id = id
        this.categoryId = categoryId
        this.supplierId = supplierId
        this.brand = brand
        this.model = model
        this.price = price
        this.stock = stock
        this.nombre = nombre
        this.categoria = categoria
        this.sku = sku
        this.nivelReorden = nivelReorden
        this.proveedor = proveedor
        this.ultimoRestock = ultimoRestock
    }
}