import axios, { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/booking/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

type ErrorBody = {
  message?: string | string[]
  errors?: Record<string, string[]>
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    const status = error.response?.status
    if (status === 401) {
      clearToken()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
    }

    const data = error.response?.data
    if (error.response) {
      const message = Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message
      const rejection: ApiError = {
        message: message || 'Ошибка сервера',
        statusCode: status ?? 500,
        errors: data?.errors,
      }
      return Promise.reject(rejection)
    }

    return Promise.reject({ message: 'Нет соединения с сервером' })
  },
)

export default api
