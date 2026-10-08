<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { pageOrders } from '@/api/order'
import { applyTicket, getDraft, listMyDrafts, saveDraft } from '@/api/ticket'
import type { Order, Ticket } from '@/types/api'
import { TICKET_TYPE } from '@/utils/ticket'

const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const saving = ref(false)
const loadingPage = ref(false)
const orders = ref<Order[]>([])
const draftNo = ref('')

const form = reactive({
  orderNo: '',
  skuId: undefined as number | undefined,
  type: 1,
  num: 1,
  reason: '',
  exchangeSkuId: undefined as number | undefined,
})

const hasDraft = computed(() => !!draftNo.value)

function fillFromTicket(t: Ticket) {
  form.orderNo = t.orderNo
  form.skuId = t.skuId
  form.type = t.type ?? 1
  form.num = t.num ?? 1
  form.reason = t.reason || ''
  form.exchangeSkuId = t.exchangeSkuId ?? undefined
  draftNo.value = t.aftersaleNo
}

function clearDraftMeta() {
  draftNo.value = ''
}

async function tryLoadDraft(orderNo: string, skuId: number) {
  const draft = await getDraft(orderNo, skuId)
  if (draft && (draft.draft || draft.status === -1)) {
    fillFromTicket(draft)
    return true
  }
  clearDraftMeta()
  return false
}

async function loadOrders() {
  loadingPage.value = true
  try {
    const data = await pageOrders({ page: 1, size: 50 })
    orders.value = data.records || []

    const qOrder = route.query.orderNo as string | undefined
    const qSku = route.query.skuId as string | undefined
    if (qOrder) {
      form.orderNo = qOrder
      onOrderChange(qOrder)
    }
    if (qSku) form.skuId = Number(qSku)

    if (form.orderNo && form.skuId) {
      const loaded = await tryLoadDraft(form.orderNo, form.skuId)
      if (loaded) {
        ElMessage.info('已加载草稿')
        return
      }
    }

    // 无指定单时：若只有一条草稿，提示并回填
    const mine = await listMyDrafts()
    if (mine?.length === 1 && !form.orderNo) {
      fillFromTicket(mine[0])
      ElMessage.info('已加载未提交草稿')
    }
  } finally {
    loadingPage.value = false
  }
}

function onOrderChange(orderNo: string) {
  const o = orders.value.find((x) => x.orderNo === orderNo)
  if (o) {
    form.skuId = o.skuId
    form.num = Math.min(form.num || 1, o.num)
  }
  clearDraftMeta()
  if (form.orderNo && form.skuId) {
    tryLoadDraft(form.orderNo, form.skuId).then((ok) => {
      if (ok) ElMessage.info('已加载该订单草稿')
    })
  }
}

function payload() {
  return {
    orderNo: form.orderNo,
    skuId: form.skuId as number,
    type: form.type,
    num: form.num,
    reason: form.reason || undefined,
    exchangeSkuId: form.type === 2 ? form.exchangeSkuId : undefined,
  }
}

async function onSave() {
  if (!form.orderNo || !form.skuId) {
    ElMessage.warning('请选择订单')
    return
  }
  saving.value = true
  try {
    const draft = await saveDraft(payload())
    draftNo.value = draft.aftersaleNo
    ElMessage.success('草稿已保存')
  } finally {
    saving.value = false
  }
}

async function onSubmit() {
  if (!form.orderNo || !form.skuId) {
    ElMessage.warning('请选择订单')
    return
  }
  if (form.type === 2 && !form.exchangeSkuId) {
    ElMessage.warning('换货须填写目标 SKU')
    return
  }
  submitting.value = true
  try {
    const ticket = await applyTicket(payload())
    ElMessage.success('提交成功')
    clearDraftMeta()
    router.replace({ name: 'workbench', query: { no: ticket.aftersaleNo } })
  } finally {
    submitting.value = false
  }
}

onMounted(loadOrders)
</script>

<template>
  <div class="page" v-loading="loadingPage">
    <el-card shadow="never" style="max-width: 640px">
      <template #header>
        <div class="head">
          <span>申请售后</span>
          <el-tag v-if="hasDraft" type="info" size="small">已有草稿 {{ draftNo }}</el-tag>
        </div>
      </template>
      <el-form label-width="100px" @submit.prevent="onSubmit">
        <el-form-item label="订单" required>
          <el-select
            v-model="form.orderNo"
            filterable
            placeholder="选择订单"
            style="width: 100%"
            @change="onOrderChange"
          >
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
          <el-input v-model="form.reason" type="textarea" :rows="3" placeholder="可先保存草稿，原因可后填" />
        </el-form-item>
        <el-form-item>
          <el-button :loading="saving" @click="onSave">保存</el-button>
          <el-button type="primary" :loading="submitting" native-type="submit">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
        <p class="hint">保存：写入草稿，下次进入可回填。提交：删除草稿并创建正式售后单。</p>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.page { height: 100%; overflow: auto; }
.head { display: flex; align-items: center; gap: 10px; }
.hint { margin: 0; color: #64748b; font-size: 12px; line-height: 1.5; }
</style>
