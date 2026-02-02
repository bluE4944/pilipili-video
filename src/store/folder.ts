import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FolderConfig } from '@/types'
import { folderApi } from '@/api/folder'

// 导出类型供其他模块使用
export type { FolderConfig }

export const useFolderStore = defineStore('folder', () => {
  const folders = ref<FolderConfig[]>([])

  // 从后端加载配置
  const loadFolders = async () => {
    try {
      folders.value = await folderApi.getFolders()
    } catch (error) {
      console.error('Failed to load folder configs:', error)
      // 降级到本地存储
      const stored = localStorage.getItem('folderConfigs')
      if (stored) {
        try {
          folders.value = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse stored folder configs:', e)
          folders.value = []
        }
      }
    }
  }

  // 添加文件夹
  const addFolder = async (config: Omit<FolderConfig, 'id' | 'createdAt'>) => {
    try {
      const newFolder = await folderApi.addFolder(config)
      folders.value.push(newFolder)
      return newFolder
    } catch (error) {
      console.error('Failed to add folder:', error)
      // 降级到本地存储
      const newFolder: FolderConfig = {
        ...config,
        id: Date.now().toString(),
        createdAt: Date.now()
      }
      folders.value.push(newFolder)
      localStorage.setItem('folderConfigs', JSON.stringify(folders.value))
      return newFolder
    }
  }

  // 删除文件夹
  const removeFolder = async (id: string) => {
    try {
      await folderApi.deleteFolder(id)
      const index = folders.value.findIndex(f => f.id === id)
      if (index > -1) {
        folders.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to delete folder:', error)
      // 降级到本地存储
      const index = folders.value.findIndex(f => f.id === id)
      if (index > -1) {
        folders.value.splice(index, 1)
        localStorage.setItem('folderConfigs', JSON.stringify(folders.value))
      }
    }
  }

  // 更新文件夹
  const updateFolder = async (id: string, updates: Partial<FolderConfig>) => {
    try {
      const updated = await folderApi.updateFolder(id, updates)
      const index = folders.value.findIndex(f => f.id === id)
      if (index > -1) {
        folders.value[index] = updated
      }
      return updated
    } catch (error) {
      console.error('Failed to update folder:', error)
      // 降级到本地存储
      const index = folders.value.findIndex(f => f.id === id)
      if (index > -1) {
        folders.value[index] = { ...folders.value[index], ...updates }
        localStorage.setItem('folderConfigs', JSON.stringify(folders.value))
        return folders.value[index]
      }
      throw error
    }
  }

  // 启用/禁用文件夹
  const toggleFolder = async (id: string, enabled: boolean) => {
    try {
      const updated = await folderApi.toggleFolder(id, enabled)
      const index = folders.value.findIndex(f => f.id === id)
      if (index > -1) {
        folders.value[index] = updated
      }
      return updated
    } catch (error) {
      console.error('Failed to toggle folder:', error)
      // 降级到本地存储
      return updateFolder(id, { enabled })
    }
  }

  // 获取启用的文件夹路径
  const enabledPaths = computed(() => {
    return folders.value.filter(f => f.enabled).map(f => f.path)
  })

  // 初始化加载
  loadFolders().catch(console.error)

  return {
    folders,
    enabledPaths,
    addFolder,
    removeFolder,
    updateFolder,
    toggleFolder,
    loadFolders
  }
})
