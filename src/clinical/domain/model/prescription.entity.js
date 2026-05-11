export class Prescription {
    constructor({
        id = 0,
        prescriptionUuid = '',
        clinicalRecordId = 0,
        odSphere = 0,
        odCylinder = 0,
        odAxis = 0,
        oiSphere = 0,
        oiCylinder = 0,
        oiAxis = 0,
        addition = null,
        notes = '',
        createdAt = '',
        doctorName = ''
    } = {}) {
        this.id = id
        this.prescriptionUuid = prescriptionUuid
        this.clinicalRecordId = clinicalRecordId
        this.odSphere = odSphere
        this.odCylinder = odCylinder
        this.odAxis = odAxis
        this.oiSphere = oiSphere
        this.oiCylinder = oiCylinder
        this.oiAxis = oiAxis
        this.addition = addition
        this.notes = notes
        this.createdAt = createdAt
        this.doctorName = doctorName
    }

    get formattedDate() {
        if (!this.createdAt) return ''
        return this.createdAt.split('T')[0]
    }

    formatValue(val) {
        if (val === null || val === undefined) return '—'
        const n = parseFloat(val)
        if (isNaN(n)) return '—'
        return n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)
    }
}
