import { Product } from '../domain/model/product.entity.js'
import { ProductResource } from './product.resource.js'

export class ProductAssembler {
    static toEntityFromResource(resource) {
        return new Product({
            id:                     resource.product_id,
            categoryId:             resource.category_id,
            supplierId:             resource.supplier_id,
            brand:                  resource.brand                   ?? '',
            model:                  resource.model                   ?? '',
            price:                  resource.price                   ?? 0,
            stock:                  resource.stock                   ?? 0,
            name:                   resource.name                    ?? '',
            category:               resource.category                ?? '',
            sku:                    resource.sku                     ?? '',
            minimumStockThreshold:  resource.minimum_stock_threshold ?? 10,
            supplierName:           resource.supplier_name           ?? '',
            lastRestockDate:        resource.last_restock_date       ?? ''
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(resource => ProductAssembler.toEntityFromResource(resource))
    }

    static toResourceFromEntity(product) {
        return new ProductResource({
            product_id:              product.id,
            category_id:             product.categoryId,
            supplier_id:             product.supplierId,
            brand:                   product.brand,
            model:                   product.model,
            price:                   product.price,
            stock:                   product.stock,
            name:                    product.name,
            category:                product.category,
            sku:                     product.sku,
            minimum_stock_threshold: product.minimumStockThreshold,
            supplier_name:           product.supplierName,
            last_restock_date:       product.lastRestockDate
        })
    }
}