import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, refreshAccess } from '@/api/auth'
import type { TokenVO } from '@/types/api'

/** 仅存非敏感展示信息；Access 只放内存 */
const PROFILE_KEY = 'as_profile'

type Profile = Pick<TokenVO, 'userId' | 'username' | 'role' | 'expiresIn' | 'tokenType'>

function loadProfile(): Profile | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as Profile) : null
  } catch {
    return null
  }
}

function toProfile(vo: TokenVO): Profile {
  return {
    userId: vo.userId,
    username: vo.username,
    role: vo.role,
    expiresIn: vo.expiresIn,
    tokenType: vo.tokenType,
  }
}

export const useUserStore = defineStore('user', () => {
  /** Access JWT：仅内存，刷新页后靠 Refresh Cookie 静默续期 */
  const token = ref('')
  const profile = ref<Profile | null>(loadProfile())
  let bootPromise: Promise<boolean> | null = null

  const isLogin = computed(() => !!token.value)
  const role = computed(() => profile.value?.role || '')
  const username = computed(() => profile.value?.username || '')
  const userId = computed(() => profile.value?.userId)

  function applyToken(vo: TokenVO) {
    token.value = vo.token
    profile.value = toProfile(vo)
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile.value))
  }

  async function login(username: string, password: string) {
    const vo = await loginApi(username, password)
    applyToken(vo)
    return vo
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {
      /* ignore */
    }
    clear()
  }

  function clear() {
    token.value = ''
    profile.value = null
    sessionStorage.removeItem(PROFILE_KEY)
  }

  /** 用 Refresh Cookie 换 Access；失败返回 false（须重新登录） */
  async function tryRefresh(): Promise<boolean> {
    try {
      const vo = await refreshAccess()
      applyToken(vo)
      return true
    } catch {
      clear()
      return false
    }
  }

  /**
   * 应用启动 / 路由进入前：无 Access 时尝试 Cookie 续期一次。
   * 有 Access 则直接 true。
   */
  function bootstrap(): Promise<boolean> {
    if (token.value) {
      return Promise.resolve(true)
    }
    if (!bootPromise) {
      bootPromise = tryRefresh().finally(() => {
        bootPromise = null
      })
    }
    return bootPromise
  }

  return {
    token,
    profile,
    isLogin,
    role,
    username,
    userId,
    login,
    logout,
    clear,
    applyToken,
    tryRefresh,
    bootstrap,
  }
})
