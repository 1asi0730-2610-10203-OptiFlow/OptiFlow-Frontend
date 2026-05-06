import { Product } from '../domain/model/product.entity.js'
import { ProductResource } from './product.resource.js'

export class ProductAssembler {
    static toEntityFromResource(r) {
        return new Product({
            id:            r.product_id,
            categoryId:    r.category_id,
            supplierId:    r.supplier_id,
            brand:         r.brand         ?? '',
            model:         r.model         ?? '',
            price:         r.precioUnitario ?? r.price ?? 0,
            stock:         r.stock         ?? 0,
            nombre:        r.nombre        ?? '',
            categoria:     r.categoria     ?? '',
            sku:           r.sku           ?? '',
            nivelReorden:  r.nivelReorden  ?? 10,
            proveedor:     r.proveedor     ?? '',
            ultimoRestock: r.ultimoRestock ?? ''
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => ProductAssembler.toEntityFromResource(r))
    }

    static toResourceFromEntity(product) {
        return new ProductResource({
            product_id:     product.id,
            category_id:    product.categoryId,
            supplier_id:    product.supplierId,
            brand:          product.brand,
            model:          product.model,
            price:          product.price,
            stock:          product.stock,
            nombre:         product.nombre,
            categoria:      product.categoria,
            sku:            product.sku,
            nivelReorden:   product.nivelReorden,
            precioUnitario: product.price,
            proveedor:      product.proveedor,
            ultimoRestock:  product.ultimoRestock
        })
    }
}