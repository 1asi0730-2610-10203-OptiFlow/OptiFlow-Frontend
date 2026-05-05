export class SaleDetail {
  constructor({
    id = 0,
    saleId = 0,
    productId = 0,
    productName = '',
    quantity = 1,
    unitPrice = 0,
    subtotal = 0
  } = {}) {
    this.id = id
    this.saleId = saleId
    this.productId = productId
    this.productName = productName
    this.quantity = quantity
    this.unitPrice = unitPrice
    this.subtotal = subtotal
  }
}
