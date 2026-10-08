<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  pageTickets,
  getTicket,
  approveTicket,
  rejectTicket,
  withdrawTicket,
  shipTicket,
  receiveTicket,
  refundTicket,
} from '@/api/ticket'
import type { Ticket } from '@/types/api'
import { TICKET_STATUS, TICKET_TYPE, STATUS_TAG, isTerminal } from '@/utils/ticket'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const listLoading = ref(false)
const detailLoading = ref(false)
const rows = ref<Ticket[]>([])
const total = ref(0)
const selectedNo = ref('')
const ticket = ref<Ticket | null>(null)

const query = reactive({
  page: 1,
  size: 20,
  status: undefined as number | undefined,
})

const keyword = ref('')
const remark = ref('')
const shipForm = reactive({ company: '顺丰', trackingNo: '', phone: '' })
const refundForm = reactive({ amount: undefined as number | undefined, channel: '原路退回', remark: '' })

const terminal = computed(() => isTerminal(ticket.value?.status))
const canApprove = computed(() => ticket.value?.status === 0 && ['MERCHANT', 'ADMIN'].includes(user.role))
const canReject = canApprove
const canWithdraw = computed(
  () => !!ticket.value && [0, 1].includes(ticket.value.status) && ['USER', 'ADMIN'].includes(user.role),
)
const canShip = computed(() => ticket.value?.status === 1 && ['WAREHOUSE', 'ADMIN'].includes(user.role))
const canReceive = computed(() => ticket.value?.status === 2 && ['USER', 'ADMIN'].includes(user.role))
const canRefund = computed(() => ticket.value?.status === 3 && ['MERCHANT', 'ADMIN'].includes(user.role))

function syncStatusFromRoute() {
  const s = route.query.status
  query.status = s === undefined || s === '' ? undefined : Number(s)
  query.page = 1
}

async function loadList(keepSelection = true) {
  listLoading.value = true
  try {
    const data = await pageTickets({
      page: query.page,
      size: query.size,
      aftersaleNo: keyword.value || undefined,
      status: query.status,
    })
    rows.value = data.records || []
    total.value = data.total || 0
    const still = rows.value.find((r) => r.aftersaleNo === selectedNo.value)
    if (!keepSelection || !still) {
      if (rows.value.length) {
        await selectTicket(rows.value[0].aftersaleNo)
      } else {
        selectedNo.value = ''
        ticket.value = null
      }
    }
  } finally {
    listLoading.value = false
  }
}

async function selectTicket(no: string) {
  selectedNo.value = no
  detailLoading.value = true
  try {
    ticket.value = await getTicket(no)
    remark.value = ''
    shipForm.trackingNo = ''
    if (ticket.value?.amount != null) refundForm.amount = ticket.value.amount
    const q: Record<string, string> = {}
    if (route.query.status != null && route.query.status !== '') {
      q.status = String(route.query.status)
    }
    q.no = no
    router.replace({ query: q })
  } finally {
    detailLoading.value = false
  }
}

async function run(action: () => Promise<Ticket>, ok = '操作成功') {
  detailLoading.value = true
  try {
    ticket.value = await action()
    ElMessage.success(ok)
    await loadList(true)
  } finally {
    detailLoading.value = false
  }
}

async function onApprove() {
  await run(() => approveTicket(selectedNo.value, remark.value || undefined), '已通过')
}
async function onReject() {
  await ElMessageBox.confirm('确认驳回？', '驳回')
  await run(() => rejectTicket(selectedNo.value, remark.value || undefined), '已驳回')
}
async function onWithdraw() {
  await ElMessageBox.confirm('确认撤回？', '撤回')
  await run(() => withdrawTicket(selectedNo.value, remark.value || undefined), '已撤回')
}
async function onShip() {
  if (!shipForm.trackingNo) {
    ElMessage.warning('请填运单号')
    return
  }
  await run(() => shipTicket(selectedNo.value, { ...shipForm }), '已发货')
}
async function onReceive() {
  await ElMessageBox.confirm('确认收货？', '收货')
  await run(() => receiveTicket(selectedNo.value), '已确认收货')
}
async function onRefund() {
  await run(
    () =>
      refundTicket(selectedNo.value, {
        amount: refundForm.amount,
        channel: refundForm.channel,
        remark: refundForm.remark || undefined,
      }),
    '退款完成',
  )
}

watch(
  () => route.query.status,
  async () => {
    syncStatusFromRoute()
    await loadList(false)
  },
)

onMounted(async () => {
  syncStatusFromRoute()
  await loadList(false)
  const no = route.query.no as string | undefined
  if (no) await selectTicket(no)
})
</script>

<template>
  <div class="workbench">
    <aside class="list-pane" v-loading="listLoading">
      <div class="list-toolbar">
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜单号"
          size="small"
          @keyup.enter="loadList(false)"
        />
        <el-button size="small" type="primary" @click="loadList(false)">查</el-button>
      </div>
      <div class="list-body">
        <div
          v-for="row in rows"
          :key="row.aftersaleNo"
          class="list-item"
          :class="{ active: row.aftersaleNo === selectedNo }"
          @click="selectTicket(row.aftersaleNo)"
        >
          <div class="row1">
            <span class="no">{{ row.aftersaleNo }}</span>
            <el-tag :type="STATUS_TAG[row.status]" size="small">
              {{ TICKET_STATUS[row.status] }}
            </el-tag>
          </div>
          <div class="row2">
            {{ TICKET_TYPE[row.type] }} · {{ row.skuName || row.skuId }} ×{{ row.num }}
          </div>
          <div class="row3">{{ row.createTime }}</div>
        </div>
        <el-empty v-if="!rows.length" description="暂无单据" :image-size="56" />
      </div>
      <div class="list-pager">
        <el-pagination
          small
          layout="prev, next"
          v-model:current-page="query.page"
          :page-size="query.size"
          :total="total"
          @current-change="loadList(false)"
        />
      </div>
    </aside>

    <section class="detail-pane" v-loading="detailLoading">
      <template v-if="ticket">
        <div class="detail-head">
          <div>
            <h2>{{ ticket.aftersaleNo }}</h2>
            <el-tag :type="STATUS_TAG[ticket.status]" size="small">
              {{ TICKET_STATUS[ticket.status] }}
            </el-tag>
            <el-tag v-if="terminal" type="info" size="small" class="ml">终态只读</el-tag>
          </div>
          <div class="muted">订单 {{ ticket.orderNo }}</div>
        </div>

        <el-descriptions :column="2" border size="small" class="mb">
          <el-descriptions-item label="类型">{{ TICKET_TYPE[ticket.type] }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ ticket.amount }}</el-descriptions-item>
          <el-descriptions-item label="商品">{{ ticket.skuName || ticket.skuId }} ×{{ ticket.num }}</el-descriptions-item>
          <el-descriptions-item label="商家">{{ ticket.merchantId }}</el-descriptions-item>
          <el-descriptions-item label="原因" :span="2">{{ ticket.reason || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="ticket.logisticsInfo" label="物流" :span="2">
            {{ ticket.logisticsInfo.company }} {{ ticket.logisticsInfo.trackingNo }}
          </el-descriptions-item>
        </el-descriptions>

        <el-row :gutter="12">
          <el-col :span="14">
            <div class="block-title">操作日志</div>
            <el-timeline v-if="ticket.logs?.length">
              <el-timeline-item
                v-for="(log, i) in ticket.logs"
                :key="i"
                :timestamp="log.createTime"
                placement="top"
              >
                <strong>{{ log.action }}</strong>
                <span class="muted"> · {{ log.operatorName || log.operatorId }}</span>
                <div class="muted" v-if="log.remark">{{ log.remark }}</div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无日志" :image-size="48" />
          </el-col>
          <el-col :span="10">
            <div class="block-title">操作</div>
            <template v-if="!terminal">
              <el-input
                v-if="canApprove || canReject || canWithdraw"
                v-model="remark"
                type="textarea"
                :rows="2"
                placeholder="备注（可选）"
                class="mb"
              />
              <div class="actions">
                <el-button v-if="canApprove" type="primary" @click="onApprove">审核通过</el-button>
                <el-button v-if="canReject" type="danger" @click="onReject">驳回</el-button>
                <el-button v-if="canWithdraw" @click="onWithdraw">撤回</el-button>
              </div>
              <template v-if="canShip">
                <el-divider content-position="left">发货</el-divider>
                <el-input v-model="shipForm.company" placeholder="物流公司" class="mb" />
                <el-input v-model="shipForm.trackingNo" placeholder="运单号" class="mb" />
                <el-button type="primary" @click="onShip">确认发货</el-button>
              </template>
              <template v-if="canReceive">
                <el-divider />
                <el-button type="primary" @click="onReceive">确认收货</el-button>
              </template>
              <template v-if="canRefund">
                <el-divider content-position="left">退款</el-divider>
                <el-input-number v-model="refundForm.amount" :min="0" :precision="2" class="mb" />
                <el-input v-model="refundForm.channel" placeholder="渠道" class="mb" />
                <el-button type="primary" @click="onRefund">确认退款</el-button>
              </template>
              <el-empty
                v-if="!canApprove && !canReject && !canWithdraw && !canShip && !canReceive && !canRefund"
                description="当前无操作权限"
                :image-size="48"
              />
            </template>
            <el-alert v-else type="info" :closable="false" title="终态不可变更" show-icon />
          </el-col>
        </el-row>
      </template>
      <el-empty v-else description="从左侧选择一笔售后单" />
    </section>
  </div>
</template>

<style scoped>
.workbench {
  display: flex;
  gap: 12px;
  height: 100%;
  min-height: 0;
}
.list-pane {
  width: 320px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.list-toolbar {
  display: flex;
  gap: 6px;
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
}
.list-body { flex: 1; overflow: auto; }
.list-item {
  padding: 10px 12px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
}
.list-item:hover { background: #f8fafc; }
.list-item.active {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}
.row1 { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.no { font-size: 13px; font-weight: 600; color: #111827; overflow: hidden; text-overflow: ellipsis; }
.row2, .row3 { font-size: 12px; color: #6b7280; margin-top: 4px; }
.list-pager {
  padding: 8px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: center;
}
.detail-pane {
  flex: 1;
  min-width: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px 18px;
  overflow: auto;
}
.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}
.detail-head h2 {
  display: inline;
  margin: 0 8px 0 0;
  font-size: 18px;
}
.block-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #111827;
}
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.mb { margin-bottom: 10px; }
.ml { margin-left: 6px; }
.muted { color: #6b7280; font-size: 13px; }
</style>
