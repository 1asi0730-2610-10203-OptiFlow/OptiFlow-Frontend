import { Feedback } from '../domain/model/feedback.entity.js'
import { FeedbackResource } from './feedback.resource.js'

export class FeedbackAssembler {
  static toEntityFromResource(resource) {
    return new Feedback({
      id: resource.id,
      saleId: resource.saleId,
      patientId: resource.patientId,
      rating: resource.rating,
      recommendService: resource.recommendService ?? true,
      comment: resource.comment ?? '',
      submittedAt: resource.submittedAt ?? ''
    })
  }

  static toResourceFromEntity(feedback) {
    return new FeedbackResource({
      id: feedback.id,
      saleId: feedback.saleId,
      patientId: feedback.patientId,
      rating: feedback.rating,
      recommendService: feedback.recommendService,
      comment: feedback.comment,
      submittedAt: feedback.submittedAt
    })
  }
}
