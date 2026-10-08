export type Role = 'USER' | 'MERCHANT' | 'WAREHOUSE' | 'ADMIN'

export interface MenuItem {
  path: string
  title: string
  roles: Role[] | null
  query?: Record<string, string>
}

/** 左侧菜单：按角色裁剪 */
export const MENUS: MenuItem[] = [
  { path: '/workbench', title: '我的售后', roles: ['USER'] },
  { path: '/workbench', title: '待审核', roles: ['MERCHANT', 'ADMIN'], query: { status: '0' } },
  { path: '/workbench', title: '待退款', roles: ['MERCHANT', 'ADMIN'], query: { status: '3' } },
  { path: '/workbench', title: '待发货', roles: ['WAREHOUSE', 'ADMIN'], query: { status: '1' } },
  { path: '/workbench', title: '全部售后', roles: ['MERCHANT', 'WAREHOUSE', 'ADMIN'] },
  { path: '/apply', title: '申请售后', roles: ['USER', 'ADMIN'] },
  { path: '/orders', title: '我的订单', roles: ['USER', 'ADMIN'] },
  { path: '/users', title: '用户管理', roles: ['ADMIN'] },
  { path: '/stock', title: '库存/SKU', roles: ['MERCHANT', 'WAREHOUSE', 'ADMIN'] },
  { path: '/notify', title: '站内信', roles: null },
]

export function menusFor(role?: string): MenuItem[] {
  const r = (role || '') as Role
  return MENUS.filter((m) => !m.roles || m.roles.includes(r))
}

export function homePath(role?: string): string {
  switch (role) {
    case 'MERCHANT':
      return '/workbench?status=0'
    case 'WAREHOUSE':
      return '/workbench?status=1'
    default:
      return '/workbench'
  }
}

export const ROLE_LABEL: Record<string, string> = {
  USER: '用户',
  MERCHANT: '商家',
  WAREHOUSE: '仓库',
  ADMIN: '管理员',
}
