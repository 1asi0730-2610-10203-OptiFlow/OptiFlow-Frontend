import axios from 'axios'

export class ReportApi {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  }

  async getAll() {
    const response = await axios.get(`${this.baseUrl}/reports`)
    return response.data
  }

  async getById(id) {
    const response = await axios.get(`${this.baseUrl}/reports/${id}`)
    return response.data
  }
}
