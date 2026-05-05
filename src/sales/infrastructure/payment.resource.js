export class PaymentResource {
  constructor({ id, saleId, amountPaid, method, paidAt }) {
    this.id = id
    this.saleId = saleId
    this.amountPaid = amountPaid
    this.method = method
    this.paidAt = paidAt
  }
}
