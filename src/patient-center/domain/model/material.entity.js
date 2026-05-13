export class Material {
    constructor({
        id = 0,
        name = '',
        info = '',
        price = 0,
        details = ''
    } = {}) {
        this.id = id;
        this.name = name;
        this.info = info;
        this.price = price;
        this.details = details;
    }
}
