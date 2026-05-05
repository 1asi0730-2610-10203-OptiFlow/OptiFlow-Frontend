export class Payment {
  constructor({
    id = 0,
    saleId = 0,
    amountPaid = 0,
    method = '',
    paidAt = ''
  } = {}) {
    this.id = id
    this.saleId = saleId
    this.amountPaid = amountPaid
    this.method = method
    this.paidAt = paidAt
  }
}

export const PaymentMethod = Object.freeze({
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  TRANSFER: 'TRANSFER'
})
