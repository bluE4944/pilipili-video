import { apiRequest } from '@/utils/api'
import type { BackendDanmaku } from '@/types'

const toTimestamp = (value?: string) => {
  if (!value) return Date.now()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

export interface Danmaku {
  id: string
  videoId: string
  userId?: string
  content: string
  color?: string
  fontSize?: number
  time?: number
  type?: number
  createdAt: number
}

const toNumericId = (value?: string | number) => {
  if (value === undefined || value === null) return undefined
  const text = String(value)
  return /^\d+$/.test(text) ? text : undefined
}

const mapDanmaku = (item: BackendDanmaku): Danmaku => {
  return {
    id: String(item.id ?? ''),
    videoId: String(item.videoId ?? ''),
    userId: item.userId ? String(item.userId) : undefined,
    content: item.content || '',
    color: item.color,
    fontSize: item.fontSize,
    time: item.time,
    type: item.type,
    createdAt: toTimestamp(item.createTime)
  }
}

export const danmakuApi = {
  async getDanmakus(videoId: string): Promise<Danmaku[]> {
    const list = await apiRequest.get<BackendDanmaku[]>(`/api/video/danmaku/${videoId}`)
    return (list || []).map(mapDanmaku)
  },

  async addDanmaku(payload: {
    videoId: string
    content: string
    time: number
    color?: string
    fontSize?: number
    type?: number
  }): Promise<Danmaku> {
    const result = await apiRequest.post<BackendDanmaku>('/api/video/danmaku', {
      videoId: toNumericId(payload.videoId),
      content: payload.content,
      time: payload.time,
      color: payload.color,
      fontSize: payload.fontSize,
      type: payload.type
    })
    return mapDanmaku(result)
  },

  deleteDanmaku(danmakuId: string): Promise<void> {
    return apiRequest.delete<void>(`/api/video/danmaku/${danmakuId}`)
  }
}
