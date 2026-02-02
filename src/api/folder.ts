import { apiRequest } from '@/utils/api'
import type { FolderConfig } from '@/types'

// 文件夹配置相关 API
export const folderApi = {
  // 获取所有文件夹配置
  getFolders(): Promise<FolderConfig[]> {
    return apiRequest.get<FolderConfig[]>('/api/folder/configs')
  },

  // 添加文件夹配置
  addFolder(config: Omit<FolderConfig, 'id' | 'createdAt'>): Promise<FolderConfig> {
    return apiRequest.post<FolderConfig>('/api/folder/configs', config)
  },

  // 更新文件夹配置
  updateFolder(id: string, config: Partial<FolderConfig>): Promise<FolderConfig> {
    return apiRequest.put<FolderConfig>(`/api/folder/configs/${id}`, config)
  },

  // 删除文件夹配置
  deleteFolder(id: string): Promise<void> {
    return apiRequest.delete<void>(`/api/folder/configs/${id}`)
  },

  // 启用/禁用文件夹
  toggleFolder(id: string, enabled: boolean): Promise<FolderConfig> {
    return apiRequest.put<FolderConfig>(`/api/folder/configs/${id}/toggle`, { enabled })
  }
}
