import { Payment } from '../domain/model/payment.entity.js'
import { PaymentResource } from './payment.resource.js'

export class PaymentAssembler {
  static toEntityFromResource(resource) {
    return new Payment({
      id: resource.id,
      saleId: resource.saleId,
      amountPaid: resource.amountPaid,
      method: resource.method,
      paidAt: resource.paidAt ?? ''
    })
  }

  static toEntitiesFromResponse(resources) {
    return resources.map(r => PaymentAssembler.toEntityFromResource(r))
  }

  static toResourceFromEntity(payment) {
    return new PaymentResource({
      id: payment.id,
      saleId: payment.saleId,
      amountPaid: payment.amountPaid,
      method: payment.method,
      paidAt: payment.paidAt
    })
  }
}
