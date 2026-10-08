import { getData } from './http'
import type { PageResult, SkuVO } from '@/types/api'

export function listSku(params?: Record<string, unknown>) {
  return getData<PageResult<SkuVO> | SkuVO[]>('/sku/list', params)
}

export function getStock(skuId: number) {
  return getData<SkuVO>(`/stock/${skuId}`)
}
