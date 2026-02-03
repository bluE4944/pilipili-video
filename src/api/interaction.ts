import { apiRequest } from '@/utils/api'
import type { BackendVideoCollect, PageResult } from '@/types'

const toTimestamp = (value?: string) => {
  if (!value) return Date.now()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

export interface VideoCollect {
  id: string
  videoId: string
  folderName?: string
  createdAt: number
}

const mapCollect = (collect: BackendVideoCollect): VideoCollect => {
  return {
    id: String(collect.id ?? ''),
    videoId: String(collect.videoId ?? ''),
    folderName: collect.folderName,
    createdAt: toTimestamp(collect.createTime)
  }
}

const mapCollectPage = (page: PageResult<BackendVideoCollect>): PageResult<VideoCollect> => {
  return {
    ...page,
    records: (page.records || []).map(mapCollect)
  }
}

export const collectApi = {
  async getUserCollects(pageNum = 1, pageSize = 10): Promise<PageResult<VideoCollect>> {
    const page = await apiRequest.get<PageResult<BackendVideoCollect>>('/api/video/interaction/collect/list', {
      params: { pageNum, pageSize }
    })
    return mapCollectPage(page)
  },

  isCollected(videoId: string): Promise<boolean> {
    return apiRequest.get<boolean>(`/api/video/interaction/collect/${videoId}`)
  },

  collectVideo(videoId: string, folderName?: string): Promise<void> {
    return apiRequest.post<void>(`/api/video/interaction/collect/${videoId}`, null, {
      params: { folderName }
    })
  },

  cancelCollect(videoId: string): Promise<void> {
    return apiRequest.delete<void>(`/api/video/interaction/collect/${videoId}`)
  }
}

export const likeApi = {
  isLiked(videoId: string): Promise<boolean> {
    return apiRequest.get<boolean>(`/api/video/interaction/like/${videoId}`)
  },

  setLike(videoId: string, isLike: boolean): Promise<void> {
    return apiRequest.post<void>(`/api/video/interaction/like/${videoId}`, null, {
      params: { isLike: isLike ? 1 : 0 }
    })
  }
}
