export class Sale {
  constructor({
    id = 0,
    invoiceNumber = '',
    labOrderNumber = '',
    patientId = 0,
    patientName = '',
    patientRx = '',
    userId = 0,
    userName = '',
    articulos = [],
    items = [],
    totalAmount = 0,
    adelanto = 0,
    pendingBalance = 0,
    discountCode = '',
    discountAmount = 0,
    status = 'PENDING',
    paymentMethod = '',
    createdAt = '',
    deliveredAt = '',
    notes = ''
  } = {}) {
    this.id = id
    this.invoiceNumber = invoiceNumber
    this.labOrderNumber = labOrderNumber
    this.patientId = patientId
    this.patientName = patientName
    this.patientRx = patientRx
    this.userId = userId
    this.userName = userName
    this.articulos = articulos
    this.items = items
    this.totalAmount = totalAmount
    this.adelanto = adelanto
    this.pendingBalance = pendingBalance
    this.discountCode = discountCode
    this.discountAmount = discountAmount
    this.status = status
    this.paymentMethod = paymentMethod
    this.createdAt = createdAt
    this.deliveredAt = deliveredAt
    this.notes = notes
  }
}

export const SaleStatus = Object.freeze({
  PENDING:   'PENDING',
  PARTIAL:   'PARTIAL',
  PAID:      'PAID',
  DELIVERED: 'DELIVERED',
  RETURNED:  'RETURNED'
})
