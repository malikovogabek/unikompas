import { api } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/api'

export async function login(body: LoginRequest): Promise<AuthResponse> {
  return (await api.post<AuthResponse>('/auth/login', body)).data
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  return (await api.post<AuthResponse>('/auth/register', body)).data
}

export async function fetchMe(): Promise<User> {
  return (await api.get<User>('/auth/me')).data
}
