export class SupplierResource {
    constructor({supplier_id = 0, name = '', contact_person = '', phone = '', email = ''} = {}) {
        this.supplier_id = supplier_id
        this.name = name
        this.contact_person = contact_person
        this.phone = phone
        this.email = email
    }
}