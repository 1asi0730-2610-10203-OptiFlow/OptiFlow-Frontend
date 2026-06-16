export class PatientResource {
    constructor({
                    first_name = '',
                    last_name  = '',
                    dni        = '',
                    phone      = '',
                    email      = '',
                    birth_date = ''
                } = {}) {
        // El backend acepta CreatePatientResource / UpdatePatientResource en camelCase
        this.firstName = first_name
        this.lastName  = last_name
        this.dni       = dni
        this.phone     = phone
        this.email     = email
        this.birthDate = birth_date
    }
}