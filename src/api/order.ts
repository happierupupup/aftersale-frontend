import { getData } from './http'
import type { Order, PageResult } from '@/types/api'

export function pageOrders(params: Record<string, unknown>) {
  return getData<PageResult<Order>>('/order/list', params)
}
