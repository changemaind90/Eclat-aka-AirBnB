import api from './index'
import type { AuthResponse } from '@/types'

export default {
  async login(credentials: { email: string; password: string }) {
    return await api.post<AuthResponse>('/auth/login', credentials)
  },

  async register(userData: { email: string; password: string }) {
    return await api.post<AuthResponse>('/auth/register', userData)
  }
}
