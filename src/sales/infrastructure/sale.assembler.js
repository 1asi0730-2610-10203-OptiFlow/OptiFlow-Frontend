import { Sale } from '../domain/model/sale.entity.js'
import { SaleResource } from './sale.resource.js'

export class SaleAssembler {
  static toEntityFromResource(resource) {
    return new Sale({
      id: resource.id,
      invoiceNumber: resource.invoiceNumber,
      patientId: resource.patientId,
      patientName: resource.patientName,
      userId: resource.userId,
      userName: resource.userName,
      totalAmount: resource.totalAmount,
      discountCode: resource.discountCode ?? '',
      discountAmount: resource.discountAmount ?? 0,
      pendingBalance: resource.pendingBalance ?? 0,
      status: resource.status,
      paymentMethod: resource.paymentMethod ?? '',
      createdAt: resource.createdAt,
      deliveredAt: resource.deliveredAt ?? '',
      notes: resource.notes ?? ''
    })
  }

  static toEntitiesFromResponse(resources) {
    return resources.map(r => SaleAssembler.toEntityFromResource(r))
  }

  static toResourceFromEntity(sale) {
    return new SaleResource({
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      patientId: sale.patientId,
      patientName: sale.patientName,
      userId: sale.userId,
      userName: sale.userName,
      totalAmount: sale.totalAmount,
      discountCode: sale.discountCode,
      discountAmount: sale.discountAmount,
      pendingBalance: sale.pendingBalance,
      status: sale.status,
      paymentMethod: sale.paymentMethod,
      createdAt: sale.createdAt,
      deliveredAt: sale.deliveredAt,
      notes: sale.notes
    })
  }
}
