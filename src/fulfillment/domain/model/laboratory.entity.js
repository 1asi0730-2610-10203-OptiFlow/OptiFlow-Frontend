export class Laboratory {
    constructor({
                    id = 0,
                    name = '',
                    contactInfo = ''
                } = {}) {
        this.id = id
        this.name = name
        this.contactInfo = contactInfo
    }
}