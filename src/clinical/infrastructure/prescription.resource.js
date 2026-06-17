export class PrescriptionResource {
    constructor({
                    clinical_record_id = 0,
                    od_sphere   = 0,
                    od_cylinder = 0,
                    od_axis     = 0,
                    oi_sphere   = 0,
                    oi_cylinder = 0,
                    oi_axis     = 0,
                    addition    = null,
                    notes       = '',
                    doctor_name = ''
                } = {}) {
        this.clinicalRecordId = clinical_record_id
        this.odSphere         = od_sphere
        this.odCylinder       = od_cylinder
        this.odAxis           = od_axis
        this.oiSphere         = oi_sphere
        this.oiCylinder       = oi_cylinder
        this.oiAxis           = oi_axis
        this.addition         = addition
        this.notes            = notes
        this.doctorName       = doctor_name
    }
}