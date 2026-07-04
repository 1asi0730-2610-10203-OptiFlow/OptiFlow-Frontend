import axios from 'axios'

// Rutas públicas que NO necesitan Authorization header
const PUBLIC_PATHS = [
  '/api/v1/authentication/sign-up',
  '/api/v1/authentication/sign-in',
  '/api/v1/authentication/password-recoveries',
  '/api/v1/authentication/password-resets',
];

export class BaseApi {
  #http

  constructor() {
    this.#http = axios.create({
      baseURL: import.meta.env.VITE_OPTIFLOW_API_URL,
    })

    this.#http.interceptors.request.use(
      (config) => {
        const isPublic = PUBLIC_PATHS.some(p => config.url?.includes(p));
        if (!isPublic) {
          const token = localStorage.getItem('token');
          if (token) config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  get http() {
    return this.#http
  }
}