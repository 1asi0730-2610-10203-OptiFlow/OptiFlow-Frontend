export class SaleResource {
  constructor({
    id,
    invoiceNumber,
    patientId,
    patientName,
    userId,
    userName,
    totalAmount,
    discountCode,
    discountAmount,
    pendingBalance,
    status,
    paymentMethod,
    createdAt,
    deliveredAt,
    notes
  }) {
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
