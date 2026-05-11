import { Prescription } from '../domain/model/prescription.entity.js'
import { PrescriptionResource } from './prescription.resource.js'

export class PrescriptionAssembler {
    static toEntityFromResource(resource) {
        return new Prescription({
            id:               resource.prescription_id    ?? 0,
            prescriptionUuid: resource.prescription_uuid  ?? '',
            clinicalRecordId: resource.clinical_record_id ?? 0,
            odSphere:         resource.od_sphere          ?? 0,
            odCylinder:       resource.od_cylinder        ?? 0,
            odAxis:           resource.od_axis            ?? 0,
            oiSphere:         resource.oi_sphere          ?? 0,
            oiCylinder:       resource.oi_cylinder        ?? 0,
            oiAxis:           resource.oi_axis            ?? 0,
            addition:         resource.addition           ?? null,
            notes:            resource.notes              ?? '',
            createdAt:        resource.created_at         ?? '',
            doctorName:       resource.doctor_name        ?? 'Dra. Emily Smith'
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => PrescriptionAssembler.toEntityFromResource(r))
    }

    static toResourceFromEntity(presc) {
        return new PrescriptionResource({
            prescription_id:    presc.id,
            prescription_uuid:  presc.prescriptionUuid,
            clinical_record_id: presc.clinicalRecordId,
            od_sphere:          presc.odSphere,
            od_cylinder:        presc.odCylinder,
            od_axis:            presc.odAxis,
            oi_sphere:          presc.oiSphere,
            oi_cylinder:        presc.oiCylinder,
            oi_axis:            presc.oiAxis,
            addition:           presc.addition,
            notes:              presc.notes,
            created_at:         presc.createdAt,
            doctor_name:        presc.doctorName
        })
    }
}
