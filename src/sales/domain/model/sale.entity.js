export class Sale {
  constructor({
    id = 0,
    invoiceNumber = '',
    patientId = 0,
    patientName = '',
    userId = 0,
    userName = '',
    totalAmount = 0,
    discountCode = '',
    discountAmount = 0,
    pendingBalance = 0,
    status = 'PENDING',
    paymentMethod = '',
    createdAt = '',
    deliveredAt = '',
    notes = ''
  } = {}) {
    this.id = id
    this.invoiceNumber = invoiceNumber
    this.patientId = patientId
    this.patientName = patientName
    this.userId = userId
    this.userName = userName
    this.totalAmount = totalAmount
    this.discountCode = discountCode
    this.discountAmount = discountAmount
    this.pendingBalance = pendingBalance
    this.status = status
    this.paymentMethod = paymentMethod
    this.createdAt = createdAt
    this.deliveredAt = deliveredAt
    this.notes = notes
  }
}

export const SaleStatus = Object.freeze({
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED'
})
