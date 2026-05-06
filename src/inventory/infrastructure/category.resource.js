export class CategoryResource {
    constructor({category_id = 0, name = ''} = {}) {
        this.category_id = category_id
        this.name = name
    }
}