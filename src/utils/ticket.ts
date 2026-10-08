export const TICKET_STATUS: Record<number, string> = {
  0: '待审核',
  1: '待仓库发货',
  2: '待用户收货',
  3: '待退款',
  4: '已办结',
  5: '已驳回',
  6: '已撤回',
}

export const TICKET_TYPE: Record<number, string> = {
  1: '退货',
  2: '换货',
  3: '仅退款',
}

export const STATUS_TAG: Record<number, '' | 'success' | 'warning' | 'info' | 'danger'> = {
  0: 'warning',
  1: '',
  2: '',
  3: 'warning',
  4: 'success',
  5: 'danger',
  6: 'info',
}

export function isTerminal(status?: number) {
  return status === 4 || status === 5 || status === 6
}
