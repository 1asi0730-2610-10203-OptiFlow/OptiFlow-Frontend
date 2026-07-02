import axios from 'axios'

// Token temporal obtenido de Swagger (sign-in)
// Reemplázalo cuando expire (dura 7 días)
const TEMP_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJqdWFucGFuQGdtYWlsLmNvbSIsIm5iZiI6MTc4Mjk0Nzc1OSwiZXhwIjoxNzgzNTUyNTU5LCJpYXQiOjE3ODI5NDc3NTl9.nxsH1bYzDWUID4f_wkUGjvQQJcHP0_I3MBpJJX9rWdY'

export class BaseApi {
  #http

  constructor() {
    this.#http = axios.create({
      baseURL: import.meta.env.VITE_OPTIFLOW_API_URL,
      headers: {
        'Authorization': `Bearer ${TEMP_TOKEN}`
      }
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