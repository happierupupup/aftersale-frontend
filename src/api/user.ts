import { getData, postData, putData } from './http'
import http from './http'
import type { PageResult, R, SysUser } from '@/types/api'

export function pageUsers(params: Record<string, unknown>) {
  return getData<PageResult<SysUser>>('/user/list', params)
}

export function createUser(body: {
  username: string
  password: string
  roles: string[]
  deptId: number
}) {
  return postData<number>('/user', body)
}

export function updateUser(
  id: number,
  body: { password?: string; roles?: string[]; deptId?: number; status?: number },
) {
  return putData<void>(`/user/${id}`, body)
}

export function grantRoles(id: number, operatorId: number, roles: string[]) {
  return putData<void>(`/user/${id}/roles`, { operatorId, roles })
}

export async function deleteUser(id: number) {
  const { data } = await http.delete<R<void>>(`/user/${id}`)
  if (data.code !== 0) throw data
}
