export class SaleDetailResource {
  constructor({ id, saleId, productId, productName, quantity, unitPrice, subtotal }) {
    this.id = id
    this.saleId = saleId
    this.productId = productId
    this.productName = productName
    this.quantity = quantity
    this.unitPrice = unitPrice
    this.subtotal = subtotal
  }
}
