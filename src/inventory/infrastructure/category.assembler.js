import { Category } from '../domain/model/category.entity.js'

export class CategoryAssembler {
    static toEntityFromResource(r) {
        return new Category({
            id: r.category_id,
            name: r.name
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => CategoryAssembler.toEntityFromResource(r))
    }
}