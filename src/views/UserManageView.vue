<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageUsers, createUser, updateUser, deleteUser } from '@/api/user'
import type { SysUser } from '@/types/api'
import { ROLE_LABEL } from '@/utils/roles'

const loading = ref(false)
const rows = ref<SysUser[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, username: '', role: '' })

const dialog = ref(false)
const editing = ref<SysUser | null>(null)
const form = reactive({
  username: '',
  password: '123456',
  roles: ['USER'] as string[],
  deptId: 4,
  status: 1,
})

const ROLE_OPTS = [
  { value: 'USER', label: '用户' },
  { value: 'MERCHANT', label: '商家' },
  { value: 'WAREHOUSE', label: '仓库' },
  { value: 'ADMIN', label: '管理员' },
]

async function load() {
  loading.value = true
  try {
    const data = await pageUsers({
      page: query.page,
      size: query.size,
      username: query.username || undefined,
      role: query.role || undefined,
    })
    rows.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.username = ''
  form.password = '123456'
  form.roles = ['USER']
  form.deptId = 4
  form.status = 1
  dialog.value = true
}

function openEdit(row: SysUser) {
  editing.value = row
  form.username = row.username
  form.password = ''
  form.roles = row.roles?.length ? [...row.roles] : [row.role || 'USER']
  form.deptId = row.deptId || 4
  form.status = row.status ?? 1
  dialog.value = true
}

async function onSave() {
  if (editing.value) {
    await updateUser(editing.value.id, {
      password: form.password || undefined,
      roles: form.roles,
      deptId: form.deptId,
      status: form.status,
    })
    ElMessage.success('已更新')
  } else {
    if (!form.username || !form.password) {
      ElMessage.warning('请填写用户名和密码')
      return
    }
    await createUser({
      username: form.username,
      password: form.password,
      roles: form.roles,
      deptId: form.deptId,
    })
    ElMessage.success('已创建')
  }
  dialog.value = false
  await load()
}

async function onDelete(row: SysUser) {
  await ElMessageBox.confirm(`删除用户 ${row.username}？`, '删除')
  await deleteUser(row.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page">
    <el-card shadow="never" class="card">
      <div class="toolbar">
        <el-form :inline="true" @submit.prevent="load">
          <el-form-item label="用户名">
            <el-input v-model="query.username" clearable style="width: 140px" />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="query.role" clearable placeholder="全部" style="width: 120px">
              <el-option v-for="r in ROLE_OPTS" :key="r.value" :label="r.label" :value="r.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click=";(query.page = 1), load()">查询</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="openCreate">新增用户</el-button>
      </div>

      <el-table :data="rows" v-loading="loading" stripe height="100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column label="角色" min-width="120">
          <template #default="{ row }">
            {{ (row.roles || [row.role]).map((x: string) => ROLE_LABEL[x] || x).join('、') }}
          </template>
        </el-table-column>
        <el-table-column prop="deptId" label="部门" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="onDelete(row)">删除</el-button>
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
    </el-card>

    <el-dialog v-model="dialog" :title="editing ? '编辑用户' : '新增用户'" width="420px">
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="!!editing" />
        </el-form-item>
        <el-form-item :label="editing ? '新密码' : '密码'">
          <el-input v-model="form.password" type="password" show-password :placeholder="editing ? '留空不改' : ''" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roles" multiple style="width: 100%">
            <el-option v-for="r in ROLE_OPTS" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门ID">
          <el-input-number v-model="form.deptId" :min="1" />
        </el-form-item>
        <el-form-item v-if="editing" label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { height: 100%; }
.card { height: 100%; display: flex; flex-direction: column; }
.card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.pager { margin-top: 12px; display: flex; justify-content: flex-end; }
</style>
