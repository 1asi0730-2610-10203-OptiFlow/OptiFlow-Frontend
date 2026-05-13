export class LaboratoryResource {
    constructor({lab_id = 0, name = '', contact_info = ''} = {}) {
        this.lab_id = lab_id
        this.name = name
        this.contact_info = contact_info
    }
}