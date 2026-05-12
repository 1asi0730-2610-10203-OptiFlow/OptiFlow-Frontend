import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

export class OrderApi extends BaseApi {
    #endpoint

    constructor() {
        super()
        this.#endpoint = new BaseEndpoint(this.http, '/lab-orders') 
    }

    async getOrderByNumber(orderNumber) {
        return await this.#endpoint.getAllByParam('order_number', orderNumber)
    }
}
