import { Supplier } from '../domain/model/supplier.entity.js'
import { SupplierResource } from './supplier.resource.js'

export class SupplierAssembler {
    static toEntityFromResource(r) {
        return new Supplier({
            id: r.supplier_id,
            name: r.name,
            contactPerson: r.contact_person ?? '',
            phone: r.phone ?? '',
            email: r.email ?? ''
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => SupplierAssembler.toEntityFromResource(r))
    }

    static toResourceFromEntity(supplier) {
        return new SupplierResource({
            supplier_id: supplier.id,
            name: supplier.name,
            contact_person: supplier.contactPerson,
            phone: supplier.phone,
            email: supplier.email
        })
    }
}