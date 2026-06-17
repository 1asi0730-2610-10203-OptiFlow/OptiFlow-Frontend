import { Prescription } from '../domain/model/prescription.entity.js'
import { PrescriptionResource } from './prescription.resource.js'

export class PrescriptionAssembler {
    static toEntityFromResource(resource) {
        return new Prescription({
            id:               resource.id ?? 0,
            prescriptionUuid: '',                                                      // ya no viene del backend
            clinicalRecordId: resource.clinicalRecordId ?? resource.clinical_record_id ?? 0,
            odSphere:         resource.odSphere         ?? resource.od_sphere          ?? 0,
            odCylinder:       resource.odCylinder       ?? resource.od_cylinder        ?? 0,
            odAxis:           resource.odAxis           ?? resource.od_axis            ?? 0,
            oiSphere:         resource.oiSphere         ?? resource.oi_sphere          ?? 0,
            oiCylinder:       resource.oiCylinder       ?? resource.oi_cylinder        ?? 0,
            oiAxis:           resource.oiAxis           ?? resource.oi_axis            ?? 0,
            addition:         resource.addition         ?? null,
            notes:            resource.notes            ?? '',
            createdAt:        resource.createdAt        ?? resource.created_at         ?? '',
            doctorName:       resource.doctorName       ?? resource.doctor_name        ?? 'Dra. Emily Smith'
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => PrescriptionAssembler.toEntityFromResource(r))
    }

    static toResourceFromEntity(presc) {
        return new PrescriptionResource({
            clinical_record_id: presc.clinicalRecordId,
            od_sphere:          presc.odSphere,
            od_cylinder:        presc.odCylinder,
            od_axis:            presc.odAxis,
            oi_sphere:          presc.oiSphere,
            oi_cylinder:        presc.oiCylinder,
            oi_axis:            presc.oiAxis,
            addition:           presc.addition,
            notes:              presc.notes,
            doctor_name:        presc.doctorName
        })
    }
}