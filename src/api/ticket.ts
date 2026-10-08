import { getData, postData } from './http'
import type { LogisticsInfo, PageResult, RefundDetail, Ticket } from '@/types/api'

export function pageTickets(params: Record<string, unknown>) {
  return getData<PageResult<Ticket>>('/aftersale/page', params)
}

export function getTicket(aftersaleNo: string) {
  return getData<Ticket>(`/aftersale/${aftersaleNo}`)
}

export function applyTicket(body: {
  orderNo: string
  skuId: number
  type: number
  num: number
  reason?: string
  exchangeSkuId?: number
}) {
  return postData<Ticket>('/aftersale/apply', body)
}

export function approveTicket(aftersaleNo: string, remark?: string) {
  return postData<Ticket>('/aftersale/approve', { aftersaleNo, remark })
}

export function rejectTicket(aftersaleNo: string, remark?: string) {
  return postData<Ticket>('/aftersale/reject', { aftersaleNo, remark })
}

export function withdrawTicket(aftersaleNo: string, remark?: string) {
  return postData<Ticket>('/aftersale/withdraw', { aftersaleNo, remark })
}

export function shipTicket(aftersaleNo: string, logisticsInfo: LogisticsInfo) {
  return postData<Ticket>('/aftersale/ship', { aftersaleNo, logisticsInfo })
}

export function receiveTicket(aftersaleNo: string) {
  return postData<Ticket>('/aftersale/receive', { aftersaleNo })
}

export function refundTicket(aftersaleNo: string, refundDetail?: RefundDetail) {
  return postData<Ticket>('/aftersale/refund', { aftersaleNo, refundDetail })
}
