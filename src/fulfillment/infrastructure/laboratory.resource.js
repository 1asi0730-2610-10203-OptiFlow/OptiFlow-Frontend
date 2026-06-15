export class LaboratoryResource {
    constructor({id = 0, name = '', phone = '', email = ''} = {}) {
        this.id = id
        this.name = name
        this.phone = phone
        this.email = email
    }
}