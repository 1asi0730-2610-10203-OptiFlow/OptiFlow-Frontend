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
        // Only include IDs when they have real values (not 0 / empty)
        // json-server auto-generates `id`; sending patient_id:0 causes conflicts
        if (patient_id && patient_id !== 0) this.patient_id = patient_id
        if (customer_uuid && customer_uuid.length > 0) this.customer_uuid = customer_uuid
        this.first_name    = first_name
        this.last_name     = last_name
        this.dni           = dni
        this.phone         = phone
        this.email         = email
        this.birth_date    = birth_date
    }
}
