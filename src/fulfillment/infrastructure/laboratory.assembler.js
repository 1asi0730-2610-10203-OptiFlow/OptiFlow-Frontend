import { Laboratory } from '../domain/model/laboratory.entity.js'

export class LaboratoryAssembler {
    static toEntityFromResource(r) {
        return new Laboratory({
            id: r.lab_id,
            name: r.name,
            contactInfo: r.contact_info ?? ''
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => LaboratoryAssembler.toEntityFromResource(r))
    }
}