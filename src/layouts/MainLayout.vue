<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { menusFor, ROLE_LABEL, homePath, type MenuItem } from '@/utils/roles'
import { SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const menus = computed(() => menusFor(user.role))

function menuKey(m: MenuItem) {
  const status = m.query?.status
  return status != null ? `${m.path}?status=${status}` : m.path
}

const active = computed(() => {
  if (route.path === '/workbench') {
    const s = route.query.status
    if (s != null && s !== '') return `/workbench?status=${s}`
  }
  return route.path
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
    <el-aside width="200px" class="aside">
      <div class="brand" @click="router.push(homePath(user.role))">Aftersale</div>
      <el-menu :key="active" :default-active="active" class="menu">
        <el-menu-item
          v-for="m in menus"
          :key="menuKey(m)"
          :index="menuKey(m)"
          @click="goMenu(m)"
        >
          <span>{{ m.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="title">{{ (route.meta.title as string) || '售后平台' }}</div>
        <div class="user">
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
.aside { background: #111827; color: #e5e7eb; }
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
.menu :deep(.el-menu-item) { color: #d1d5db; }
.menu :deep(.el-menu-item.is-active),
.menu :deep(.el-menu-item:hover) {
  background: rgba(96, 165, 250, 0.15) !important;
  color: #93c5fd;
}
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
