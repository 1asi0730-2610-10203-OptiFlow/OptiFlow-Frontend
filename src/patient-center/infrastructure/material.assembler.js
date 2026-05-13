import { Material } from '../domain/model/material.entity.js'


export class MaterialAssembler {
    static toEntityFromResource(resource) {
        return new Material({
            id:      resource.material_id,
            name:    resource.full_name,
            info:    resource.index_value,
            price:   resource.base_price,
            details: resource.description
        });
    }

    static toEntitiesFromResponse(resources) {
        if (!Array.isArray(resources)) return [];
        return resources.map(r => this.toEntityFromResource(r));
    }
}
