import axios from 'axios'

export class BaseApi {
  #http

  constructor() {
    this.#http = axios.create({
      baseURL: import.meta.env.VITE_OPTIFLOW_API_URL
    })

    this.#http.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  get http() {
    return this.#http
  }
}
