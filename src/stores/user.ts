import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import type { TokenVO } from '@/types/api'

const TOKEN_KEY = 'as_token'
const USER_KEY = 'as_user'

function loadUser(): TokenVO | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as TokenVO) : null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const profile = ref<TokenVO | null>(loadUser())

  const isLogin = computed(() => !!token.value)
  const role = computed(() => profile.value?.role || '')
  const username = computed(() => profile.value?.username || '')
  const userId = computed(() => profile.value?.userId)

  async function login(username: string, password: string) {
    const vo = await loginApi(username, password)
    token.value = vo.token
    profile.value = vo
    localStorage.setItem(TOKEN_KEY, vo.token)
    localStorage.setItem(USER_KEY, JSON.stringify(vo))
    return vo
  }

  async function logout() {
    try {
      if (token.value) await logoutApi()
    } catch {
      /* ignore */
    }
    clear()
  }

  function clear() {
    token.value = ''
    profile.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, profile, isLogin, role, username, userId, login, logout, clear }
})
