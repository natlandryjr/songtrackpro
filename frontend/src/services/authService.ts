import api from './api'
import type { LoginCredentials, RegisterData, User, AuthTokens } from '@/types'

interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile')
    return response.data
  },
}