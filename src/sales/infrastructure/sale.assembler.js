import { Sale } from '../domain/model/sale.entity.js'
import { SaleResource } from './sale.resource.js'

export class SaleAssembler {
  static toEntityFromResource(r) {
    return new Sale({
      id: r.id,
      invoiceNumber: r.invoiceNumber,
      labOrderNumber: r.labOrderNumber ?? '',
      patientId: r.patientId,
      patientName: r.patientName,
      patientRx: r.patientRx ?? '',
      userId: r.userId,
      userName: r.userName,
      articulos: r.articulos ?? [],
      items: r.items ?? [],
      totalAmount: r.totalAmount,
      adelanto: r.advance ?? 0,
      pendingBalance: r.pendingBalance ?? 0,
      discountCode: r.discountCode ?? '',
      discountAmount: r.discountAmount ?? 0,
      status: r.status,
      paymentMethod: r.paymentMethod ?? '',
      createdAt: r.createdAt,
      deliveredAt: r.deliveredAt ?? '',
      notes: r.notes ?? ''
    })
  }

  static toEntitiesFromResponse(resources) {
    return resources.map(r => SaleAssembler.toEntityFromResource(r))
  }

  static toResourceFromEntity(s) {
    return new SaleResource({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      labOrderNumber: s.labOrderNumber,
      patientId: s.patientId,
      patientName: s.patientName,
      patientRx: s.patientRx,
      userId: s.userId,
      userName: s.userName,
      articulos: s.articulos,
      items: s.items,
      totalAmount: s.totalAmount,
      advance: s.adelanto,
      pendingBalance: s.pendingBalance,
      discountCode: s.discountCode,
      discountAmount: s.discountAmount,
      status: s.status,
      paymentMethod: s.paymentMethod,
      createdAt: s.createdAt,
      deliveredAt: s.deliveredAt,
      notes: s.notes
    })
  }
}
