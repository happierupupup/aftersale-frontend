import { getData, putData } from './http'
import type { NotifyItem, PageResult } from '@/types/api'

export function listNotify(params: Record<string, unknown>) {
  return getData<PageResult<NotifyItem>>('/notify/list', params)
}

export function markNotifyRead(id: number) {
  return putData<void>(`/notify/${id}/read`)
}
