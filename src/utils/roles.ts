export type Role = 'USER' | 'MERCHANT' | 'WAREHOUSE' | 'ADMIN'

export interface MenuItem {
  path: string
  title: string
  roles: Role[] | null
  query?: Record<string, string>
}

/** 侧栏分组；有 children 时渲染为折叠菜单 */
export interface MenuGroup {
  title: string
  roles: Role[] | null
  children: MenuItem[]
}

export type MenuEntry = MenuItem | MenuGroup

export function isMenuGroup(m: MenuEntry): m is MenuGroup {
  return Array.isArray((m as MenuGroup).children)
}

const ROLE_MENUS: Record<Role, MenuGroup[]> = {
  USER: [
    {
      title: '售后管理',
      roles: ['USER'],
      children: [
        { path: '/workbench', title: '我的售后', roles: ['USER'] },
        { path: '/apply', title: '申请售后', roles: ['USER'] },
        { path: '/orders', title: '我的订单', roles: ['USER'] },
      ],
    },
  ],
  MERCHANT: [
    {
      title: '售后管理',
      roles: ['MERCHANT'],
      children: [
        { path: '/workbench', title: '待审核', roles: ['MERCHANT'], query: { status: '0' } },
        { path: '/workbench', title: '待退款', roles: ['MERCHANT'], query: { status: '3' } },
        { path: '/workbench', title: '全部售后', roles: ['MERCHANT'] },
      ],
    },
    {
      title: '库存管理',
      roles: ['MERCHANT'],
      children: [{ path: '/stock', title: '库存/SKU', roles: ['MERCHANT'] }],
    },
  ],
  WAREHOUSE: [
    {
      title: '售后管理',
      roles: ['WAREHOUSE'],
      children: [
        { path: '/workbench', title: '待发货', roles: ['WAREHOUSE'], query: { status: '1' } },
        { path: '/workbench', title: '全部售后', roles: ['WAREHOUSE'] },
      ],
    },
    {
      title: '库存管理',
      roles: ['WAREHOUSE'],
      children: [{ path: '/stock', title: '库存/SKU', roles: ['WAREHOUSE'] }],
    },
  ],
  ADMIN: [
    {
      title: '售后管理',
      roles: ['ADMIN'],
      children: [
        { path: '/workbench', title: '待审核', roles: ['ADMIN'], query: { status: '0' } },
        { path: '/workbench', title: '待仓库发货', roles: ['ADMIN'], query: { status: '1' } },
        { path: '/workbench', title: '待用户收货', roles: ['ADMIN'], query: { status: '2' } },
        { path: '/workbench', title: '待退款', roles: ['ADMIN'], query: { status: '3' } },
        { path: '/workbench', title: '已办结', roles: ['ADMIN'], query: { status: '4' } },
        { path: '/workbench', title: '已驳回', roles: ['ADMIN'], query: { status: '5' } },
        { path: '/workbench', title: '已撤回', roles: ['ADMIN'], query: { status: '6' } },
        { path: '/workbench', title: '全部售后', roles: ['ADMIN'] },
        { path: '/apply', title: '申请售后', roles: ['ADMIN'] },
      ],
    },
    {
      title: '订单管理',
      roles: ['ADMIN'],
      children: [{ path: '/orders', title: '订单列表', roles: ['ADMIN'] }],
    },
    {
      title: '用户管理',
      roles: ['ADMIN'],
      children: [{ path: '/users', title: '用户列表', roles: ['ADMIN'] }],
    },
    {
      title: '库存管理',
      roles: ['ADMIN'],
      children: [{ path: '/stock', title: '库存/SKU', roles: ['ADMIN'] }],
    },
  ],
}

export function menuKey(m: MenuItem) {
  const status = m.query?.status
  return status != null ? `${m.path}?status=${status}` : m.path
}

/** 左侧菜单：按角色返回分组 */
export function menusFor(role?: string): MenuEntry[] {
  const r = (role || '') as Role
  return ROLE_MENUS[r] || []
}

/** 展平后的叶子项（高亮 / 顶栏标题用） */
export function flatMenuItems(role?: string): MenuItem[] {
  const out: MenuItem[] = []
  for (const e of menusFor(role)) {
    if (isMenuGroup(e)) out.push(...e.children)
    else out.push(e)
  }
  return out
}

export function homePath(role?: string): string {
  switch (role) {
    case 'MERCHANT':
      return '/workbench?status=0'
    case 'WAREHOUSE':
      return '/workbench?status=1'
    case 'ADMIN':
      return '/workbench?status=0'
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
