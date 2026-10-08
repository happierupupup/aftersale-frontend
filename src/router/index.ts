import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { homePath } from '@/utils/roles'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      redirect: () => {
        const user = useUserStore()
        return homePath(user.role)
      },
      children: [
        {
          path: 'workbench',
          name: 'workbench',
          component: () => import('@/views/WorkbenchView.vue'),
          meta: { title: '售后工作台' },
        },
        {
          path: 'apply',
          name: 'apply',
          component: () => import('@/views/TicketApplyView.vue'),
          meta: { title: '申请售后', roles: ['USER', 'ADMIN'] },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/views/OrderListView.vue'),
          meta: { title: '我的订单', roles: ['USER', 'ADMIN'] },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/UserManageView.vue'),
          meta: { title: '用户管理', roles: ['ADMIN'] },
        },
        {
          path: 'stock',
          name: 'stock',
          component: () => import('@/views/StockListView.vue'),
          meta: { title: '库存/SKU', roles: ['MERCHANT', 'WAREHOUSE', 'ADMIN'] },
        },
        {
          path: 'notify',
          name: 'notify',
          component: () => import('@/views/NotifyListView.vue'),
          meta: { title: '站内信' },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const user = useUserStore()
  if (!to.meta.public && !user.isLogin) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && user.isLogin) {
    return homePath(user.role)
  }
  const roles = to.meta.roles as string[] | undefined
  if (roles && user.role && !roles.includes(user.role) && user.role !== 'ADMIN') {
    return homePath(user.role)
  }
  return true
})

export default router
