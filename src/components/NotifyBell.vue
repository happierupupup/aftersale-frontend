<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { listNotify, markNotifyRead } from '@/api/notify'
import type { NotifyItem } from '@/types/api'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const unread = ref(0)
const items = ref<NotifyItem[]>([])
const loading = ref(false)
const open = ref(false)

const showBadge = computed(() => unread.value > 0)

async function refreshUnread() {
  if (!user.userId) {
    unread.value = 0
    return
  }
  try {
    const data = await listNotify({
      page: 1,
      size: 1,
      readFlag: 0,
      userId: user.userId,
    })
    unread.value = data.total || 0
  } catch {
    /* 顶栏轮询失败不打断主流程 */
  }
}

async function loadRecent() {
  if (!user.userId) return
  loading.value = true
  try {
    const data = await listNotify({
      page: 1,
      size: 30,
      userId: user.userId,
    })
    items.value = data.records || []
  } finally {
    loading.value = false
  }
}

async function onRead(row: NotifyItem) {
  if (row.readFlag === 1) return
  await markNotifyRead(row.id)
  row.readFlag = 1
  unread.value = Math.max(0, unread.value - 1)
  ElMessage.success('已标记已读')
}

watch(open, (v) => {
  if (v) {
    void loadRecent()
    void refreshUnread()
  }
})

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  void refreshUnread()
  timer = setInterval(() => void refreshUnread(), 60_000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <el-popover
    v-model:visible="open"
    placement="bottom-end"
    :width="360"
    trigger="click"
    popper-class="notify-popper"
  >
    <template #reference>
      <button type="button" class="bell-btn" aria-label="站内信">
        <el-badge :value="unread" :hidden="!showBadge" :max="99">
          <el-icon :size="20"><Bell /></el-icon>
        </el-badge>
      </button>
    </template>

    <div class="panel">
      <div class="panel-head">
        <span>站内信</span>
        <span v-if="unread" class="muted">{{ unread }} 条未读</span>
      </div>
      <div class="panel-body" v-loading="loading">
        <div
          v-for="row in items"
          :key="row.id"
          class="item"
          :class="{ unread: row.readFlag !== 1 }"
          @click="onRead(row)"
        >
          <div class="item-title">
            <span class="dot" v-if="row.readFlag !== 1" />
            {{ row.title }}
          </div>
          <div class="item-content">{{ row.content }}</div>
          <div class="item-meta">{{ row.createTime }}</div>
        </div>
        <el-empty v-if="!loading && !items.length" description="暂无消息" :image-size="48" />
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.bell-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #374151;
  cursor: pointer;
}
.bell-btn:hover {
  background: #f3f4f6;
  color: #111827;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px 10px;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
}
.muted { font-weight: 400; font-size: 12px; color: #6b7280; }
.panel-body {
  max-height: 360px;
  overflow-y: auto;
  margin-top: 8px;
  min-height: 80px;
}
.item {
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.item:hover { background: #f8fafc; }
.item.unread { background: #eff6ff; }
.item.unread:hover { background: #dbeafe; }
.item-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}
.item-content {
  margin-top: 4px;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.item-meta {
  margin-top: 4px;
  font-size: 11px;
  color: #9ca3af;
}
</style>
