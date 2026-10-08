import { postData } from './http'
import type { TokenVO } from '@/types/api'

export function login(username: string, password: string) {
  return postData<TokenVO>('/api/auth/login', { username, password })
}

export function logout() {
  return postData<void>('/api/auth/logout')
}
