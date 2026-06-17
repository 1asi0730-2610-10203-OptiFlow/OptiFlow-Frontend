import { Laboratory } from '../domain/model/laboratory.entity.js'
import { LaboratoryResource } from './laboratory.resource.js'

export class LaboratoryAssembler {
    static toEntityFromResource(r) {
        return new Laboratory({
            id: r.id,
            name: r.name,
            phone: r.phone ?? '',
            email: r.email ?? ''
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => LaboratoryAssembler.toEntityFromResource(r))
    }

    static toResourceFromEntity(entity) {
        return new LaboratoryResource({
            name: entity.name,
            phone: entity.phone,
            email: entity.email
        })
    }
}