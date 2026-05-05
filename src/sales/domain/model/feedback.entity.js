export class Feedback {
  constructor({
    id = 0,
    saleId = 0,
    patientId = 0,
    rating = 5,
    recommendService = true,
    comment = '',
    submittedAt = ''
  } = {}) {
    this.id = id
    this.saleId = saleId
    this.patientId = patientId
    this.rating = rating
    this.recommendService = recommendService
    this.comment = comment
    this.submittedAt = submittedAt
  }
}
