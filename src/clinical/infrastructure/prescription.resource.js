export class PrescriptionResource {
    constructor({
        prescription_id   = 0,
        prescription_uuid = '',
        clinical_record_id = 0,
        od_sphere   = 0,
        od_cylinder = 0,
        od_axis     = 0,
        oi_sphere   = 0,
        oi_cylinder = 0,
        oi_axis     = 0,
        addition    = null,
        notes       = '',
        created_at  = '',
        doctor_name = ''
    } = {}) {
        // Only include IDs when they have real values
        // json-server auto-generates `id`; sending prescription_id:0 causes conflicts
        if (prescription_id && prescription_id !== 0) this.prescription_id = prescription_id
        if (prescription_uuid && prescription_uuid.length > 0) this.prescription_uuid = prescription_uuid
        this.clinical_record_id = clinical_record_id
        this.od_sphere          = od_sphere
        this.od_cylinder        = od_cylinder
        this.od_axis            = od_axis
        this.oi_sphere          = oi_sphere
        this.oi_cylinder        = oi_cylinder
        this.oi_axis            = oi_axis
        this.addition           = addition
        this.notes              = notes
        this.created_at         = created_at
        this.doctor_name        = doctor_name
    }
}
