export interface R<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T> {
  page: number
  size: number
  total: number
  pages: number
  records: T[]
}

export interface TokenVO {
  token: string
  tokenType: string
  expiresIn: number
  userId: number
  username: string
  role: string
}

export interface LogisticsInfo {
  company?: string
  trackingNo?: string
  phone?: string
}

export interface RefundDetail {
  amount?: number
  channel?: string
  remark?: string
}

export interface TicketLog {
  action?: string
  operatorId?: number
  operatorName?: string
  beforeStatus?: number
  afterStatus?: number
  remark?: string
  createTime?: string
}

export interface Ticket {
  aftersaleNo: string
  orderNo: string
  userId: number
  merchantId: number
  type: number
  status: number
  /** 是否草稿；申请页据此回填 */
  draft?: boolean
  skuId: number
  skuName?: string
  exchangeSkuId?: number | null
  num: number
  amount: number
  reason?: string
  logisticsInfo?: LogisticsInfo | null
  refundDetail?: RefundDetail | null
  processInstanceId?: string
  createTime?: string
  logs?: TicketLog[]
}

export interface Order {
  orderNo: string
  userId: number
  merchantId?: number
  skuId: number
  skuName?: string
  num: number
  amount: number
  status?: number
  payStatus?: number
  createTime?: string
}

export interface SkuVO {
  skuId: number
  skuName?: string
  merchantId?: number
  stockNum?: number
  version?: number
  warnThreshold?: number
}

export interface NotifyItem {
  id: number
  userId: number
  title: string
  content: string
  channel?: string
  bizType?: string
  readFlag?: number
  createTime?: string
}


export interface SysUser {
  id: number
  username: string
  role?: string
  roles?: string[]
  deptId?: number
  status?: number
  createTime?: string
}
