import { Staff } from '../domain/staff.entity.js'
import { StaffResource } from './staff.resource.js'

export class StaffAssembler {
  static toEntityFromResource(r) {
    // El orden debe coincidir EXACTAMENTE con el constructor en staff.entity.js:
    // id, employeeCode, firstName, lastName, email, phone, role, department, status, activeToday, entryDate, photo
    return new Staff(
      r.id,
      r.employeeCode,
      r.firstName,
      r.lastName,
      r.email,
      r.phone || '',
      r.role,
      r.department,
      r.status,
      r.activeToday,
      r.entryDate || '',
      r.photo || ''
    )
  }

  static toEntitiesFromResponse(resources) {
    if (!Array.isArray(resources)) return []
    return resources.map(r => StaffAssembler.toEntityFromResource(r))
  }

  static toResourceFromEntity(s) {
    return new StaffResource({
      id: s.id,
      employeeCode: s.employeeCode,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      role: s.role,
      department: s.department,
      status: s.status,
      activeToday: s.activeToday,
      entryDate: s.entryDate,
      photo: s.photo
    })
  }
}
