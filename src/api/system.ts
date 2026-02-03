import { apiRequest } from '@/utils/api'
import type { BackendSystemConfig } from '@/types'

export const systemApi = {
  getAllConfigs(): Promise<BackendSystemConfig[]> {
    return apiRequest.get<BackendSystemConfig[]>('/api/system/config/all')
  },

  getConfigValue(configKey: string): Promise<string> {
    return apiRequest.get<string>(`/api/system/config/${configKey}`)
  },

  setConfigValue(payload: {
    configKey: string
    configValue: string
    configType?: number
    description?: string
  }): Promise<void> {
    return apiRequest.post<void>('/api/system/config', null, {
      params: payload
    })
  },

  deleteConfig(configKey: string): Promise<void> {
    return apiRequest.delete<void>(`/api/system/config/${configKey}`)
  }
}
