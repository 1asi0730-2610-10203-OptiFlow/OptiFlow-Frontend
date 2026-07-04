export class SaleResource {
  constructor({
    id, invoiceNumber, labOrderNumber, patientId, patientName, patientRx,
    userId, userName, items, totalAmount, advance, pendingBalance,
    discountCode, discountAmount, status, paymentMethod, createdAt, deliveredAt, notes
  }) {
    this.id = id
    this.invoiceNumber = invoiceNumber
    this.labOrderNumber = labOrderNumber
    this.patientId = patientId
    this.patientName = patientName
    this.patientRx = patientRx
    this.userId = userId
    this.userName = userName
    this.items = items
    this.totalAmount = totalAmount
    this.advance = advance
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
