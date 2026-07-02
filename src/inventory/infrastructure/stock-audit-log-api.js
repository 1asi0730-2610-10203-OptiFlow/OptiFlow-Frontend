import { BaseApi } from '../../shared/infrastructure/base-api.js'

export class StockAuditLogApi extends BaseApi {
    #resourcePath

    constructor() {
        super()
        this.#resourcePath = import.meta.env.VITE_STOCK_AUDIT_LOGS_ENDPOINT_PATH
    }

    async getAuditLogs({ from, to } = {}) {
        const response = await this.http.get(this.#resourcePath, { params: { from, to } })
        return response.data
    }
}
