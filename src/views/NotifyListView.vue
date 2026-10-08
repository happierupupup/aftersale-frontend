<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listNotify, markNotifyRead } from '@/api/notify'
import type { NotifyItem } from '@/types/api'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const loading = ref(false)
const rows = ref<NotifyItem[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, userId: user.userId })

async function load() {
  loading.value = true
  try {
    const data = await listNotify({ ...query, userId: user.userId })
    rows.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

async function onRead(row: NotifyItem) {
  if (row.readFlag === 1) return
  await markNotifyRead(row.id)
  row.readFlag = 1
  ElMessage.success('已标记已读')
}

onMounted(load)
</script>

<template>
  <div class="page"><el-card shadow="never">
    <el-table :data="rows" v-loading="loading" stripe>
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column prop="content" label="内容" min-width="240" show-overflow-tooltip />
      <el-table-column prop="bizType" label="业务" width="100" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.readFlag === 1 ? 'info' : 'warning'" size="small">
            {{ row.readFlag === 1 ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="时间" min-width="160" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="row.readFlag === 1" @click="onRead(row)">
            已读
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="load"
      />
    </div>
  </el-card></div>
</template>

<style scoped>
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
