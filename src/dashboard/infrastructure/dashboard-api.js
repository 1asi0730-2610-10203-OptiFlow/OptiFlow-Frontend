import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";
import {BaseApi} from "../../shared/infrastructure/base-api.js";

class DashboardApi extends BaseApi {
  #analyticsReports
  #staffMetrics
  #patients
  #workOrders
  #sales
  #products

  constructor() {
    super()
    this.#analyticsReports = new BaseEndpoint(this.http, import.meta.env.VITE_ANALYTICS_REPORTS_ENDPOINT_PATH)
    this.#staffMetrics     = new BaseEndpoint(this.http, import.meta.env.VITE_STAFF_METRICS_ENDPOINT_PATH)
    this.#patients         = new BaseEndpoint(this.http, import.meta.env.VITE_PATIENTS_ENDPOINT_PATH)
    this.#workOrders       = new BaseEndpoint(this.http, import.meta.env.VITE_WORK_ORDERS_ENDPOINT_PATH)
    this.#sales            = new BaseEndpoint(this.http, import.meta.env.VITE_SALES_ENDPOINT_PATH)
    this.#products         = new BaseEndpoint(this.http, import.meta.env.VITE_PRODUCTS_ENDPOINT_PATH)
  }

  async getAnalyticsReports() { return await this.#analyticsReports.getAll() }
  async getStaffMetrics()     { return await this.#staffMetrics.getAll() }
  async getPatients()         { return await this.#patients.getAll() }
  async getWorkOrders()       { return await this.#workOrders.getAll() }
  async getSales()            { return await this.#sales.getAll() }
  async getProducts()         { return await this.#products.getAll() }
}

export default DashboardApi
