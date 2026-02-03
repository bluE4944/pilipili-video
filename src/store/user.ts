import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { userApi } from '@/api/user'

const STORAGE_KEY = 'currentUser'
const TOKEN_KEY = 'token'

const buildAuthToken = (token: string, tokenType?: string) => {
  return tokenType ? `${tokenType} ${token}` : `Bearer ${token}`
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)

  const setAuthToken = (token: string, tokenType?: string) => {
    localStorage.setItem(TOKEN_KEY, buildAuthToken(token, tokenType))
  }

  const clearAuthToken = () => {
    localStorage.removeItem(TOKEN_KEY)
  }

  const loadCurrentUser = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const token = localStorage.getItem(TOKEN_KEY)

    if (stored && token) {
      try {
        currentUser.value = JSON.parse(stored)
        verifyToken()
      } catch (e) {
        console.error('Failed to load current user:', e)
        currentUser.value = null
      }
    }
  }

  const verifyToken = async () => {
    try {
      const user = await userApi.getCurrentUser()
      currentUser.value = user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      currentUser.value = null
      localStorage.removeItem(STORAGE_KEY)
      clearAuthToken()
    }
  }

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      await userApi.register(username, password)
      await login(username, password)
      return true
    } catch (error) {
      console.error('Failed to register:', error)
      throw error
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await userApi.login(username, password)
      currentUser.value = result.user
      setAuthToken(result.token, result.tokenType)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))
      return true
    } catch (error) {
      console.error('Failed to login:', error)
      const deviceId = getDeviceId()
      const guestUser: User = {
        id: `guest_${deviceId}`,
        username: `guest_${deviceId.slice(0, 8)}`,
        createdAt: Date.now()
      }
      currentUser.value = guestUser
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser))
      return false
    }
  }

  const logout = async () => {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('Failed to logout:', error)
    } finally {
      currentUser.value = null
      localStorage.removeItem(STORAGE_KEY)
      clearAuthToken()
    }
  }

  const loginAsGuest = () => {
    const deviceId = getDeviceId()
    const guestUser: User = {
      id: `guest_${deviceId}`,
      username: `guest_${deviceId.slice(0, 8)}`,
      createdAt: Date.now()
    }
    currentUser.value = guestUser
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser))
  }

  const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  }

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
