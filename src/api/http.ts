import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { R } from '@/types/api'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 20000,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const user = useUserStore()
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshQueue: Promise<boolean> | null = null

async function refreshOnce(): Promise<boolean> {
  if (!refreshQueue) {
    refreshQueue = useUserStore()
      .tryRefresh()
      .finally(() => {
        refreshQueue = null
      })
  }
  return refreshQueue
}

function shouldTryRefresh(url?: string) {
  if (!url) return true
  return !url.includes('/api/auth/login') && !url.includes('/api/auth/refresh')
}

http.interceptors.response.use(
  async (resp) => {
    const body = resp.data as R
    const cfg = resp.config as RetryConfig
    if (body && typeof body.code === 'number' && body.code !== 0) {
      if (
        (body.code === 401 || body.code === 1001) &&
        !cfg._retry &&
        shouldTryRefresh(cfg.url)
      ) {
        cfg._retry = true
        const ok = await refreshOnce()
        if (ok) {
          return http.request(cfg)
        }
        ElMessage.error(body.msg || '登录已失效，请重新登录')
        useUserStore().clear()
        router.push({ name: 'login' })
        return Promise.reject(body)
      }
      ElMessage.error(body.msg || '请求失败')
      // 登录接口本身的账号错误不要当成「会话失效」清态跳转
      if (
        (body.code === 401 || body.code === 1001) &&
        shouldTryRefresh(cfg.url)
      ) {
        useUserStore().clear()
        router.push({ name: 'login' })
      }
      return Promise.reject(body)
    }
    return resp
  },
  async (err: AxiosError<R>) => {
    const cfg = err.config as RetryConfig | undefined
    const status = err.response?.status
    const bizCode = err.response?.data?.code
    const unauthorized = status === 401 || bizCode === 401 || bizCode === 1001
    const canRefresh = shouldTryRefresh(cfg?.url)
    if (unauthorized && cfg && !cfg._retry && canRefresh) {
      cfg._retry = true
      const ok = await refreshOnce()
      if (ok) {
        return http.request(cfg)
      }
      useUserStore().clear()
      router.push({ name: 'login' })
    }
    const msg = err?.response?.data?.msg || err.message || '网络错误'
    ElMessage.error(msg)
    if (unauthorized && canRefresh) {
      useUserStore().clear()
      router.push({ name: 'login' })
    }
    return Promise.reject(err)
  },
)

export async function getData<T>(url: string, params?: object): Promise<T> {
  const { data } = await http.get<R<T>>(url, { params })
  return data.data
}

export async function postData<T>(url: string, body?: object): Promise<T> {
  const { data } = await http.post<R<T>>(url, body)
  return data.data
}

export async function putData<T>(url: string, body?: object): Promise<T> {
  const { data } = await http.put<R<T>>(url, body)
  return data.data
}

export default http
