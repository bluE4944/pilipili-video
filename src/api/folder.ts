import { apiRequest } from '@/utils/api'
import type { FolderConfig, BackendFolderConfig, PageResult } from '@/types'

const toTimestamp = (value?: string) => {
  if (!value) return Date.now()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

const mapFolderConfig = (config: BackendFolderConfig): FolderConfig => {
  return {
    id: String(config.id ?? ''),
    name: config.configName || '',
    path: config.folderPath || '',
    enabled: Number(config.enabled ?? 0) === 1,
    createdAt: toTimestamp(config.createTime)
  }
}

const toBackendConfig = (config: Partial<FolderConfig>): BackendFolderConfig => {
  return {
    configName: config.name,
    folderPath: config.path,
    enabled: config.enabled === undefined ? undefined : (config.enabled ? 1 : 0)
  }
}

export const folderApi = {
  async getFolders(pageNum = 1, pageSize = 200): Promise<FolderConfig[]> {
    const page = await apiRequest.get<PageResult<BackendFolderConfig>>('/api/local-folder/config/page', {
      params: { pageNum, pageSize }
    })
    const records = page?.records || []
    return records.map(mapFolderConfig)
  },

  async getEnabledFolders(): Promise<FolderConfig[]> {
    const configs = await apiRequest.get<BackendFolderConfig[]>('/api/local-folder/config/enabled')
    return (configs || []).map(mapFolderConfig)
  },

  addFolder(config: Omit<FolderConfig, 'id' | 'createdAt'>): Promise<FolderConfig> {
    return apiRequest.post<BackendFolderConfig>('/api/local-folder/config', toBackendConfig(config)).then(mapFolderConfig)
  },

  updateFolder(id: string, config: Partial<FolderConfig>): Promise<FolderConfig> {
    return apiRequest.put<BackendFolderConfig>(`/api/local-folder/config/${id}`, toBackendConfig(config)).then(mapFolderConfig)
  },

  deleteFolder(id: string): Promise<void> {
    return apiRequest.delete<void>(`/api/local-folder/config/${id}`)
  },

  scanFolder(configId: string): Promise<void> {
    return apiRequest.post<void>(`/api/local-folder/scan/${configId}`)
  }
}
