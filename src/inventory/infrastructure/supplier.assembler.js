import { Supplier } from '../domain/model/supplier.entity.js'
import { SupplierResource } from './supplier.resource.js'

export class SupplierAssembler {
    static toEntityFromResource(r) {
        return new Supplier({
            id: r.id,
            name: r.name,
            contactPerson: r.contactPerson ?? '',
            phone: r.phone ?? '',
            email: r.email ?? ''
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => SupplierAssembler.toEntityFromResource(r))
    }

    static toResourceFromEntity(supplier) {
        return new SupplierResource({
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            phone: supplier.phone,
            email: supplier.email
        })
    }
}