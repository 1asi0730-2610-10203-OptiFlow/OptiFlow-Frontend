export class StaffResource {
  constructor({
    id, employeeCode, firstName, lastName, email, phone, role, department, status, activeToday, entryDate, photo
  }) {
    this.id = id;
    this.employeeCode = employeeCode;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.department = department;
    this.status = status;
    this.activeToday = activeToday;
    this.entryDate = entryDate;
    this.photo = photo;
  }
}
