export class BaseEndpoint {
  #http
  #resourcePath

  constructor(http, resourcePath) {
    this.#http = http
    this.#resourcePath = resourcePath
  }

  async getAll() {
    const response = await this.#http.get(this.#resourcePath)
    return response.data
  }

  async getById(id) {
    const response = await this.#http.get(`${this.#resourcePath}/${id}`)
    return response.data
  }

  async create(resource) {
    const response = await this.#http.post(this.#resourcePath, resource)
    return response.data
  }

  async update(id, resource) {
    const response = await this.#http.put(`${this.#resourcePath}/${id}`, resource)
    return response.data
  }

  async patch(id, resource) {
    const response = await this.#http.patch(`${this.#resourcePath}/${id}`, resource)
    return response.data
  }

  async delete(id) {
    await this.#http.delete(`${this.#resourcePath}/${id}`)
  }

  async getAllByParam(paramKey, paramValue) {
    const response = await this.#http.get(this.#resourcePath, {
      params: { [paramKey]: paramValue }
    })
    return response.data
  }
}
