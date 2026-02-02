import { apiRequest } from '@/utils/api'
import type { User } from '@/types'

// 用户相关 API
export const userApi = {
  // 登录
  login(username: string, password: string): Promise<{ token: string; user: User }> {
    return apiRequest.post<{ token: string; user: User }>('/api/user/login', {
      username,
      password
    })
  },

  // 注册
  register(username: string, password: string): Promise<User> {
    return apiRequest.post<User>('/api/user/register', {
      username,
      password
    })
  },

  // 获取当前用户信息
  getCurrentUser(): Promise<User> {
    return apiRequest.get<User>('/api/user/me')
  },

  // 更新用户信息
  updateUser(user: Partial<User>): Promise<User> {
    return apiRequest.put<User>('/api/user/me', user)
  },

  // 登出
  logout(): Promise<void> {
    return apiRequest.post<void>('/api/user/logout')
  }
}
