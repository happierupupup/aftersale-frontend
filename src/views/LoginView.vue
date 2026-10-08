<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { homePath } from '@/utils/roles'

const user = useUserStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)

const form = reactive({
  username: '精神状态良好',
  password: '123456',
})

const demos = [
  { label: '用户', username: '精神状态良好' },
  { label: '商家', username: 'AAA代购' },
  { label: '仓库', username: 'AAA极速发货' },
  { label: '管理员', username: '00000' },
]

async function onSubmit() {
  loading.value = true
  try {
    await user.login(form.username, form.password)
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || homePath(user.role)
    router.replace(redirect)
  } finally {
    loading.value = false
  }
}

function fill(username: string) {
  form.username = username
  form.password = '123456'
}
</script>

<template>
  <div class="login-page">
    <div class="panel">
      <h1>售后服务平台</h1>
      <p class="sub">Vue3 Demo · 对接 gateway :8080</p>
      <el-form label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password autocomplete="current-password" />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
          登录
        </el-button>
      </el-form>
      <div class="demos">
        <span>演示账号：</span>
        <el-button
          v-for="d in demos"
          :key="d.username"
          link
          type="primary"
          @click="fill(d.username)"
        >
          {{ d.label }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background:
    radial-gradient(ellipse at 20% 20%, #bae6fd 0%, transparent 50%),
    radial-gradient(ellipse at 80% 0%, #c7d2fe 0%, transparent 45%),
    linear-gradient(160deg, #f8fafc, #e2e8f0);
}
.panel {
  width: 400px;
  padding: 36px 32px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}
h1 { margin: 0 0 4px; font-size: 24px; color: #0f172a; }
.sub { margin: 0 0 24px; color: #64748b; font-size: 13px; }
.demos {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 13px;
}
</style>
