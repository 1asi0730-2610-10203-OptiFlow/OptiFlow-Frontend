export class User {
  constructor(id, email, role = 'ADMIN', accountId = null) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.accountId = accountId;
  }

  get isClient() {
    return this.role === 'CLIENT';
  }
}
