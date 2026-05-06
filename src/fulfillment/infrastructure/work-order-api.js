import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class WorkOrderApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, import.meta.env.VITE_WORK_ORDERS_ENDPOINT_PATH)
    }

    async getWorkOrders() {
        return await this.#endpoint.getAll()
    }

    async createWorkOrder(resource) {
        return await this.#endpoint.create(resource)
    }

    async updateOrderStatus(id, status) {
        return await this.#endpoint.patch(id, { status })
    }
}