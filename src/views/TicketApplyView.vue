<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { pageOrders } from '@/api/order'
import { applyTicket } from '@/api/ticket'
import type { Order } from '@/types/api'
import { TICKET_TYPE } from '@/utils/ticket'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const orders = ref<Order[]>([])

const form = reactive({
  orderNo: '',
  skuId: undefined as number | undefined,
  type: 1,
  num: 1,
  reason: '',
  exchangeSkuId: undefined as number | undefined,
})

async function loadOrders() {
  const data = await pageOrders({ page: 1, size: 50 })
  orders.value = data.records || []
  const qOrder = route.query.orderNo as string | undefined
  const qSku = route.query.skuId as string | undefined
  if (qOrder) {
    form.orderNo = qOrder
    onOrderChange(qOrder)
  }
  if (qSku) form.skuId = Number(qSku)
}

function onOrderChange(orderNo: string) {
  const o = orders.value.find((x) => x.orderNo === orderNo)
  if (o) {
    form.skuId = o.skuId
    form.num = Math.min(form.num || 1, o.num)
  }
}

async function onSubmit() {
  if (!form.orderNo || !form.skuId) {
    ElMessage.warning('请选择订单')
    return
  }
  loading.value = true
  try {
    const ticket = await applyTicket({
      orderNo: form.orderNo,
      skuId: form.skuId,
      type: form.type,
      num: form.num,
      reason: form.reason || undefined,
      exchangeSkuId: form.type === 2 ? form.exchangeSkuId : undefined,
    })
    ElMessage.success('申请成功')
    router.replace({ name: 'workbench', query: { no: ticket.aftersaleNo } })
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)
</script>

<template>
  <div class="page"><el-card shadow="never" style="max-width: 640px">
    <template #header>申请售后</template>
    <el-form label-width="100px" @submit.prevent="onSubmit">
      <el-form-item label="订单" required>
        <el-select v-model="form.orderNo" filterable placeholder="选择订单" style="width: 100%" @change="onOrderChange">
          <el-option
            v-for="o in orders"
            :key="o.orderNo"
            :label="`${o.orderNo} · ${o.skuName || o.skuId} ×${o.num}`"
            :value="o.orderNo"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="SKU ID">
        <el-input-number v-model="form.skuId" :min="1" disabled />
      </el-form-item>
      <el-form-item label="类型" required>
        <el-radio-group v-model="form.type">
          <el-radio v-for="(label, code) in TICKET_TYPE" :key="code" :value="Number(code)">
            {{ label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.type === 2" label="换货 SKU">
        <el-input-number v-model="form.exchangeSkuId" :min="1" />
      </el-form-item>
      <el-form-item label="数量" required>
        <el-input-number v-model="form.num" :min="1" />
      </el-form-item>
      <el-form-item label="原因">
        <el-input v-model="form.reason" type="textarea" :rows="3" placeholder="可选" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" native-type="submit">提交申请</el-button>
        <el-button @click="router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card></div>
</template>

<style scoped>
.page { height: 100%; overflow: auto; }
</style>
