import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FolderConfig } from '@/types'
import { folderApi } from '@/api/folder'

export type { FolderConfig }

export const useFolderStore = defineStore('folder', () => {
  const folders = ref<FolderConfig[]>([])

  const loadFolders = async () => {
    try {
      folders.value = await folderApi.getFolders()
    } catch (error) {
      console.error('Failed to load folder configs:', error)
      throw error
    }
  }

  const addFolder = async (config: Omit<FolderConfig, 'id' | 'createdAt'>) => {
    try {
      const newFolder = await folderApi.addFolder(config)
      folders.value.push(newFolder)
      return newFolder
    } catch (error) {
      console.error('Failed to add folder:', error)
      throw error
    }
  }

  const removeFolder = async (id: string) => {
    try {
      await folderApi.deleteFolder(id)
      const index = folders.value.findIndex(f => f.id === id)
      if (index > -1) {
        folders.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to delete folder:', error)
      throw error
    }
  }

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
      throw error
    }
  }

  const toggleFolder = async (id: string, enabled: boolean) => {
    try {
      const updated = await folderApi.updateFolder(id, { enabled })
      const index = folders.value.findIndex(f => f.id === id)
      if (index > -1) {
        folders.value[index] = updated
      }
      return updated
    } catch (error) {
      console.error('Failed to toggle folder:', error)
      throw error
    }
  }

  const enabledPaths = computed(() => {
    return folders.value.filter(f => f.enabled).map(f => f.path)
  })

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
