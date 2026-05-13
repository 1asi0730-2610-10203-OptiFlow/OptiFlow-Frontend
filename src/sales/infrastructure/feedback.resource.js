export class FeedbackResource {
  constructor({ id, saleId, patientId, rating, recommendService, comment, submittedAt }) {
    this.id = id
    this.saleId = saleId
    this.patientId = patientId
    this.rating = rating
    this.recommendService = recommendService
    this.comment = comment
    this.submittedAt = submittedAt
  }
}
