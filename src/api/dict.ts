import { apiRequest } from '@/utils/api'
import type { BackendDictItem } from '@/types'

export const dictApi = {
  getDictItems(dictCode: string): Promise<BackendDictItem[]> {
    return apiRequest.get<BackendDictItem[]>(`/api/dict/${dictCode}`)
  }
}
