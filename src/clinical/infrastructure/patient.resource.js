export class PatientResource {
    constructor({
        patient_id = 0,
        customer_uuid = '',
        first_name = '',
        last_name = '',
        dni = '',
        phone = '',
        email = '',
        birth_date = ''
    } = {}) {
        this.patient_id    = patient_id
        this.customer_uuid = customer_uuid
        this.first_name    = first_name
        this.last_name     = last_name
        this.dni           = dni
        this.phone         = phone
        this.email         = email
        this.birth_date    = birth_date
    }
}
