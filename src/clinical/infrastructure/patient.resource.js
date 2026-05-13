export class PatientResource {
    constructor({
        patient_id = null,
        customer_uuid = null,
        first_name = '',
        last_name = '',
        dni = '',
        phone = '',
        email = '',
        birth_date = ''
    } = {}) {
        if (patient_id) this.patient_id    = patient_id
        if (customer_uuid) this.customer_uuid = customer_uuid
        this.first_name    = first_name
        this.last_name     = last_name
        this.dni           = dni
        this.phone         = phone
        this.email         = email
        this.birth_date    = birth_date
    }
}
