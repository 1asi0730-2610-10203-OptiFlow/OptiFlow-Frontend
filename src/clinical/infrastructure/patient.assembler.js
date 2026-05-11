import { Patient } from '../domain/model/patient.entity.js'
import { PatientResource } from './patient.resource.js'

export class PatientAssembler {
    static toEntityFromResource(resource) {
        return new Patient({
            id:           resource.patient_id    ?? 0,
            customerUuid: resource.customer_uuid ?? '',
            firstName:    resource.first_name    ?? '',
            lastName:     resource.last_name     ?? '',
            dni:          resource.dni           ?? '',
            phone:        resource.phone         ?? '',
            email:        resource.email         ?? '',
            birthDate:    resource.birth_date    ?? ''
        })
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(r => PatientAssembler.toEntityFromResource(r))
    }

    static toResourceFromEntity(patient) {
        return new PatientResource({
            patient_id:    patient.id,
            customer_uuid: patient.customerUuid,
            first_name:    patient.firstName,
            last_name:     patient.lastName,
            dni:           patient.dni,
            phone:         patient.phone,
            email:         patient.email,
            birth_date:    patient.birthDate
        })
    }
}
