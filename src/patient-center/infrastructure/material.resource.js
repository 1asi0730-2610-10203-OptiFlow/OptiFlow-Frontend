export class MaterialResource {
    constructor({
        material_id = 0,
        full_name = '',
        index_value = '',
        base_price = 0,
        description = ''
    } = {}) {
        this.material_id = material_id;
        this.full_name   = full_name;
        this.index_value = index_value;
        this.base_price  = base_price;
        this.description = description;
    }
}
