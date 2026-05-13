import { SaleDetail } from '../domain/model/sale-detail.entity.js'

export class SaleDetailAssembler {
  static toEntityFromResource(resource) {
    return new SaleDetail({
      id: resource.id,
      saleId: resource.saleId,
      productId: resource.productId,
      productName: resource.productName,
      quantity: resource.quantity,
      unitPrice: resource.unitPrice,
      subtotal: resource.subtotal
    })
  }

  static toEntitiesFromResponse(resources) {
    return resources.map(r => SaleDetailAssembler.toEntityFromResource(r))
  }
}
