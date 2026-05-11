export class Patient {
    constructor({
        id = 0,
        customerUuid = '',
        firstName = '',
        lastName = '',
        dni = '',
        phone = '',
        email = '',
        birthDate = ''
    } = {}) {
        this.id = id
        this.customerUuid = customerUuid
        this.firstName = firstName
        this.lastName = lastName
        this.dni = dni
        this.phone = phone
        this.email = email
        this.birthDate = birthDate
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim()
    }

    get initials() {
        const f = this.firstName?.[0] ?? ''
        const l = this.lastName?.[0] ?? ''
        return (f + l).toUpperCase()
    }

    get age() {
        if (!this.birthDate) return null
        const birth = new Date(this.birthDate)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
        return age
    }
}
