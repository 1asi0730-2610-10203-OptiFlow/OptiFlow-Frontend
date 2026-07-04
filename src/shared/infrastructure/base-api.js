import axios from 'axios'


// Token temporal obtenido de Swagger (sign-in). Reemplázalo cuando expire (dura 7 días).
// IMPORTANTE: renovar haciendo sign-in en http://localhost:5238/swagger
const TEMP_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJ0ZXN0QG9wdGlmbG93LmNvbSIsIm5iZiI6MTc4MzEyMDUxNCwiZXhwIjoxNzgzNzI1MzE0LCJpYXQiOjE3ODMxMjA1MTR9.xsRUf4f2wWUgchHMaCguzmHSWaJXyq1dNW0bbpJpBI8';

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
          const token = localStorage.getItem('token') || TEMP_TOKEN;
          config.headers.Authorization = `Bearer ${token}`;
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