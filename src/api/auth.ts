import axios from 'axios'
import { postData } from './http'
import type { R, TokenVO } from '@/types/api'

/** 续期单独实例，避免与业务拦截器互相递归 */
const authHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 15000,
  withCredentials: true,
})

export function login(username: string, password: string) {
  return postData<TokenVO>('/api/auth/login', { username, password })
}

export function logout() {
  return postData<void>('/api/auth/logout')
}

/** 用 HttpOnly Refresh Cookie 换新 Access（并轮换 Refresh） */
export async function refreshAccess(): Promise<TokenVO> {
  const { data } = await authHttp.post<R<TokenVO>>('/api/auth/refresh')
  if (!data || data.code !== 0 || !data.data?.token) {
    throw Object.assign(new Error(data?.msg || '续期失败'), { code: data?.code ?? 401 })
  }
  return data.data
}
