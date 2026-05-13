import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class StaffApi extends BaseApi {
  #staff

  constructor() {
    super()
    this.#staff = new BaseEndpoint(this.http, import.meta.env.VITE_STAFF_ENDPOINT_PATH)
  }

  async getStaff() {
    return await this.#staff.getAll()
  }

  async getStaffById(id) {
    return await this.#staff.getById(id)
  }

  async createEmployee(resource) {
    return await this.#staff.create(resource)
  }

  async updateEmployee(id, resource) {
    return await this.#staff.update(id, resource)
  }

  async deleteEmployee(id) {
    return await this.#staff.delete(id)
  }
}
