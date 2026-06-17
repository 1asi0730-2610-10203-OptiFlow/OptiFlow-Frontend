export class SupplierResource {
    constructor({name = '', contactPerson = '', phone = '', email = ''} = {}) {
        this.name = name
        this.contactPerson = contactPerson
        this.phone = phone
        this.email = email
    }
}