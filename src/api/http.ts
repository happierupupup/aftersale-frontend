import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { R } from '@/types/api'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const user = useUserStore()
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

http.interceptors.response.use(
  (resp) => {
    const body = resp.data as R
    if (body && typeof body.code === 'number' && body.code !== 0) {
      ElMessage.error(body.msg || '请求失败')
      if (body.code === 401 || body.code === 1001) {
        useUserStore().logout()
        router.push({ name: 'login' })
      }
      return Promise.reject(body)
    }
    return resp
  },
  (err) => {
    const msg = err?.response?.data?.msg || err.message || '网络错误'
    ElMessage.error(msg)
    if (err?.response?.status === 401) {
      useUserStore().logout()
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
