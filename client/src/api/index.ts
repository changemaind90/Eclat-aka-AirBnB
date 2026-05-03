import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/booking/api',
  timeout: 10000
})

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

function clearToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status
    if (status === 401) clearToken()

    if (error.response) {
      return Promise.reject({
        message: (error.response.data as any)?.message || 'Ошибка сервера',
        statusCode: status,
        errors: (error.response.data as any)?.errors
      })
    }

    return Promise.reject({ message: 'Нет соединения с сервером' })
  }
)

export default api