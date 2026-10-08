<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listSku, getStock } from '@/api/stock'
import type { SkuVO } from '@/types/api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const rows = ref<SkuVO[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, skuName: '' })

async function load() {
  loading.value = true
  try {
    const data = await listSku({ ...query })
    if (Array.isArray(data)) {
      rows.value = data
      total.value = data.length
    } else {
      rows.value = data.records || []
      total.value = data.total || 0
    }
  } finally {
    loading.value = false
  }
}

async function refreshStock(row: SkuVO) {
  const stock = await getStock(row.skuId)
  row.stockNum = stock.stockNum
  row.version = stock.version
  ElMessage.success(`SKU ${row.skuId} 库存 ${stock.stockNum}`)
}

function onSearch() {
  query.page = 1
  load()
}

onMounted(load)
</script>

<template>
  <div class="page"><el-card shadow="never">
    <el-form :inline="true" class="mb" @submit.prevent="onSearch">
      <el-form-item label="商品名">
        <el-input v-model="query.skuName" clearable placeholder="模糊" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="rows" v-loading="loading" stripe>
      <el-table-column prop="skuId" label="SKU" width="100" />
      <el-table-column prop="skuName" label="名称" min-width="140" />
      <el-table-column prop="merchantId" label="商家" width="90" />
      <el-table-column prop="stockNum" label="库存" width="90" />
      <el-table-column prop="warnThreshold" label="预警阈值" width="100" />
      <el-table-column prop="version" label="版本" width="80" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="refreshStock(row)">刷新库存</el-button>
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
.mb { margin-bottom: 8px; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
