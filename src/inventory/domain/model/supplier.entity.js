export class Supplier {
    constructor({id = 0, name = '', contactPerson = '', phone = '', email = ''} = {}) {
        this.id = id
        this.name = name
        this.contactPerson = contactPerson
        this.phone = phone
        this.email = email
    }
}