<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { pageOrders } from '@/api/order'
import type { Order } from '@/types/api'

const router = useRouter()
const loading = ref(false)
const rows = ref<Order[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10 })

async function load() {
  loading.value = true
  try {
    const data = await pageOrders({ ...query })
    rows.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function apply(row: Order) {
  router.push({
    name: 'apply',
    query: { orderNo: row.orderNo, skuId: String(row.skuId) },
  })
}

onMounted(load)
</script>

<template>
  <div class="page"><el-card shadow="never" class="full">
    <el-table :data="rows" v-loading="loading" stripe>
      <el-table-column prop="orderNo" label="订单号" min-width="160" />
      <el-table-column prop="skuName" label="商品" min-width="120" />
      <el-table-column prop="skuId" label="SKU" width="90" />
      <el-table-column prop="num" label="数量" width="70" />
      <el-table-column prop="amount" label="金额" width="90" />
      <el-table-column prop="createTime" label="下单时间" min-width="160" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="apply(row)">申请售后</el-button>
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
.page { height: 100%; overflow: auto; }
.full { min-height: 100%; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
