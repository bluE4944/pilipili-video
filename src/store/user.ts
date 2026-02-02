import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { userApi } from '@/api/user'

const STORAGE_KEY = 'currentUser'
const TOKEN_KEY = 'token'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)

  // 从localStorage加载当前用户
  const loadCurrentUser = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const token = localStorage.getItem(TOKEN_KEY)
    
    if (stored && token) {
      try {
        currentUser.value = JSON.parse(stored)
        // 验证token是否有效，如果无效则清除
        verifyToken()
      } catch (e) {
        console.error('Failed to load current user:', e)
        currentUser.value = null
      }
    }
  }

  // 验证token有效性
  const verifyToken = async () => {
    try {
      const user = await userApi.getCurrentUser()
      currentUser.value = user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      // Token无效，清除用户信息
      currentUser.value = null
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  // 注册
  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await userApi.register(username, password)
      // 注册成功后自动登录
      await login(username, password)
      return true
    } catch (error) {
      console.error('Failed to register:', error)
      throw error
    }
  }

  // 登录
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await userApi.login(username, password)
      currentUser.value = result.user
      localStorage.setItem(TOKEN_KEY, result.token)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))
      return true
    } catch (error) {
      console.error('Failed to login:', error)
      // 降级到本地模式
      const deviceId = getDeviceId()
      const guestUser: User = {
        id: `guest_${deviceId}`,
        username: `游客_${deviceId.slice(0, 8)}`,
        createdAt: Date.now()
      }
      currentUser.value = guestUser
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser))
      return false
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('Failed to logout:', error)
    } finally {
      currentUser.value = null
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  // 游客模式（使用设备标识）
  const loginAsGuest = () => {
    const deviceId = getDeviceId()
    const guestUser: User = {
      id: `guest_${deviceId}`,
      username: `游客_${deviceId.slice(0, 8)}`,
      createdAt: Date.now()
    }
    currentUser.value = guestUser
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser))
  }

  // 获取设备ID
  const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  }

  // 更新用户信息
  const updateUser = async (user: Partial<User>): Promise<User> => {
    try {
      const updated = await userApi.updateUser(user)
      currentUser.value = updated
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  // 初始化
  loadCurrentUser()
  if (!currentUser.value) {
    loginAsGuest()
  }

  return {
    currentUser,
    register,
    login,
    logout,
    loginAsGuest,
    updateUser,
    verifyToken
  }
})
