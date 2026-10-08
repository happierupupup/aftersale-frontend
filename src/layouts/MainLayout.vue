<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  menusFor,
  flatMenuItems,
  menuKey,
  isMenuGroup,
  ROLE_LABEL,
  homePath,
  type MenuItem,
  type MenuGroup,
} from '@/utils/roles'
import { SwitchButton } from '@element-plus/icons-vue'
import NotifyBell from '@/components/NotifyBell.vue'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const menus = computed(() => menusFor(user.role))
const leaves = computed(() => flatMenuItems(user.role))

const active = computed(() => {
  if (route.path === '/workbench') {
    const s = route.query.status
    if (s != null && s !== '') return `/workbench?status=${s}`
    // 全部售后：无 status 时与「全部」叶子对齐
    return '/workbench'
  }
  return route.path
})

const openeds = computed(() =>
  menus.value.filter(isMenuGroup).map((g) => g.title),
)

const pageTitle = computed(() => {
  const hit = leaves.value.find((m) => menuKey(m) === active.value)
  return hit?.title || (route.meta.title as string) || '售后平台'
})

function goMenu(m: MenuItem) {
  router.push({ path: m.path, query: m.query || {} })
}

async function onLogout() {
  await user.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="brand" @click="router.push(homePath(user.role))">Aftersale</div>
      <el-menu
        :default-active="active"
        :default-openeds="openeds"
        class="menu"
      >
        <template v-for="entry in menus" :key="isMenuGroup(entry) ? entry.title : menuKey(entry)">
          <el-sub-menu v-if="isMenuGroup(entry)" :index="(entry as MenuGroup).title">
            <template #title>
              <span>{{ (entry as MenuGroup).title }}</span>
            </template>
            <el-menu-item
              v-for="c in (entry as MenuGroup).children"
              :key="menuKey(c)"
              :index="menuKey(c)"
              @click="goMenu(c)"
            >
              <span>{{ c.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item
            v-else
            :index="menuKey(entry as MenuItem)"
            @click="goMenu(entry as MenuItem)"
          >
            <span>{{ (entry as MenuItem).title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="title">{{ pageTitle }}</div>
        <div class="user">
          <NotifyBell />
          <el-tag size="small">{{ ROLE_LABEL[user.role] || user.role }}</el-tag>
          <span class="name">{{ user.username }}</span>
          <el-button text type="danger" :icon="SwitchButton" @click="onLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout { height: 100vh; background: #f1f5f9; }
.aside { background: #111827; color: #e5e7eb; overflow-y: auto; }
.brand {
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  font-weight: 700;
  font-size: 17px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.menu { border-right: none; background: transparent; }
.menu :deep(.el-menu-item),
.menu :deep(.el-sub-menu__title) { color: #d1d5db; }
.menu :deep(.el-menu-item.is-active),
.menu :deep(.el-menu-item:hover),
.menu :deep(.el-sub-menu__title:hover) {
  background: rgba(96, 165, 250, 0.15) !important;
  color: #93c5fd;
}
.menu :deep(.el-sub-menu .el-menu) { background: transparent; }
.menu :deep(.el-sub-menu .el-menu-item) { padding-left: 40px !important; min-width: 0; }
.header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.title { font-weight: 600; color: #111827; }
.user { display: flex; align-items: center; gap: 10px; }
.name { color: #374151; font-size: 14px; }
.main { padding: 12px; height: calc(100vh - 52px); overflow: hidden; }
</style>
