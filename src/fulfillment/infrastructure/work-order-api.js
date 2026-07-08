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
        const response = await this.http.patch(
            `${import.meta.env.VITE_WORK_ORDERS_ENDPOINT_PATH}/${id}/status`,
            { status }
        )
        return response.data
    }

    async linkSale(id, saleId) {
        const response = await this.http.patch(
            `${import.meta.env.VITE_WORK_ORDERS_ENDPOINT_PATH}/${id}/sale`,
            { saleId }
        )
        return response.data
    }

    async deleteWorkOrder(id) {
        return await this.#endpoint.delete(id)
    }
}