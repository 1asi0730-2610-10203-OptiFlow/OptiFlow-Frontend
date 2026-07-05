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

    // Turn backend access errors into navigation instead of raw 401/403 messages.
    this.#http.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config?.url || '';
        const isPublic = PUBLIC_PATHS.some(p => url.includes(p));
        if (!isPublic && error.response) {
          const { status, data } = error.response;
          const code = data?.code;
          const path = window.location.pathname;
          if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('subscriptionActive');
            if (path !== '/login') window.location.assign('/login');
          } else if (status === 403 && (code === 'SUBSCRIPTION_REQUIRED' || code === 'ACCOUNT_SETUP_REQUIRED')) {
            if (code === 'SUBSCRIPTION_REQUIRED') localStorage.setItem('subscriptionActive', 'false');
            if (path !== '/select-plan') window.location.assign('/select-plan');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get http() {
    return this.#http
  }
}