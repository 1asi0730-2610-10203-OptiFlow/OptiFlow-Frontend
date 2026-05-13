export class ClinicalRecord {
    constructor({
        id = 0,
        clinicalRecordUuid = '',
        patientId = 0
    } = {}) {
        this.id = id
        this.clinicalRecordUuid = clinicalRecordUuid
        this.patientId = patientId
    }
}
