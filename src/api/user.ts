import { apiRequest } from '@/utils/api'
import type { User, BackendUser, LoginResult, UserCondition } from '@/types'

const toTimestamp = (value?: string) => {
  if (!value) return Date.now()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

const mapUser = (user?: BackendUser): User => {
  return {
    id: String(user?.id ?? ''),
    username: user?.username || user?.userName || user?.nikeName || '',
    avatar: undefined,
    createdAt: toTimestamp(user?.createTime),
    email: user?.email,
    phone: user?.phone,
    role: user?.role
  }
}

const toUserCondition = (user: Partial<User>): UserCondition => {
  return {
    userName: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role
  }
}

export const userApi = {
  login(username: string, password: string): Promise<{ token: string; tokenType?: string; expiresIn?: number; user: User }> {
    return apiRequest.post<LoginResult>('/api/auth/login', { username, password }).then((result) => ({
      token: result.token,
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
      user: mapUser(result.user)
    }))
  },

  refreshToken(): Promise<{ token: string; tokenType?: string; expiresIn?: number; user: User }> {
    return apiRequest.post<LoginResult>('/api/auth/refresh').then((result) => ({
      token: result.token,
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
      user: mapUser(result.user)
    }))
  },

  register(username: string, password: string): Promise<User> {
    return apiRequest.post<BackendUser>('/api/user/register', {
      userName: username,
      password
    }).then(mapUser)
  },

  getCurrentUser(): Promise<User> {
    return apiRequest.get<BackendUser>('/api/user/info').then(mapUser)
  },

  updateUser(user: Partial<User>): Promise<User> {
    return apiRequest.put<BackendUser>('/api/user/info', toUserCondition(user)).then(mapUser)
  },

  changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return apiRequest.put<void>('/api/user/password', null, {
      params: {
        oldPassword,
        newPassword
      }
    })
  },

  logout(): Promise<void> {
    return apiRequest.post<void>('/api/user/logout')
  }
}
