import { apiRequest, API_BASE_URL, resolveApiUrl } from '@/utils/api'
import { getFallbackCover } from '@/utils/fallbackCover'
import type {
  VideoCollection,
  VideoFile,
  PlayRecord,
  BackendVideoCollection,
  BackendVideoListItem,
  BackendVideoEpisode,
  BackendVideo,
  BackendVideoPlayHistoryItem,
  BackendPlayHistory,
  BackendVideoPlaySource,
  PageResult
} from '@/types'

const toTimestamp = (value?: string) => {
  if (!value) return 0
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const resolveVideoFormat = (...candidates: Array<string | undefined>) => {
  for (const candidate of candidates) {
    if (!candidate) continue
    const normalized = candidate.trim()
    if (!normalized) continue
    if (/^[a-z0-9]+$/i.test(normalized)) {
      return normalized.toLowerCase()
    }
    const pureValue = normalized.split('?')[0].split('#')[0]
    const lastDotIndex = pureValue.lastIndexOf('.')
    if (lastDotIndex >= 0 && lastDotIndex < pureValue.length - 1) {
      return pureValue.substring(lastDotIndex + 1).toLowerCase()
    }
  }
  return 'mp4'
}

const mapEpisodeToVideoFile = (episode: BackendVideoEpisode): VideoFile => {
  return {
    id: String(episode.videoId ?? episode.id ?? ''),
    name: episode.episodeName || (episode.episodeNumber ? `Episode ${episode.episodeNumber}` : 'Episode'),
    path: episode.filePath || '',
    size: Number(episode.fileSize || 0),
    modifiedTime: toTimestamp(episode.fileModifyTime),
    format: resolveVideoFormat(episode.fileFormat, episode.filePath, episode.episodeName),
    duration: undefined,
    thumbnail: undefined
  }
}

const mapVideoEntityToVideoFile = (video: BackendVideo, fallbackName?: string): VideoFile => {
  return {
    id: String(video.id ?? ''),
    name: video.title || fallbackName || '',
    path: video.videoUrl || '',
    size: Number(video.fileSize || 0),
    modifiedTime: toTimestamp(video.updateTime || video.createTime),
    format: resolveVideoFormat(video.format, video.videoUrl, video.title, fallbackName),
    duration: video.duration ?? undefined,
    thumbnail: resolveApiUrl(video.coverUrl) || getFallbackCover(video.id ?? '')
  }
}

const mapCollectionEntityToCollection = (
  collection: BackendVideoCollection | null | undefined,
  episodes?: BackendVideoEpisode[]
): VideoCollection => {
  if (!collection) {
    throw new Error('后端返回空的合集数据')
  }
  return {
    id: String(collection.id ?? ''),
    title: collection.title || '',
    description: collection.description || '',
    cover: resolveApiUrl(collection.coverUrl) || getFallbackCover(collection.id ?? ''),
    videos: episodes ? episodes.map(mapEpisodeToVideoFile) : [],
    totalEpisodes: Number(collection.videoCount ?? (episodes ? episodes.length : 0)),
    playCount: Number(collection.playCount ?? 0),
    likeCount: Number(collection.likeCount ?? 0),
    collectCount: Number(collection.collectCount ?? 0),
    createdAt: toTimestamp(collection.createTime),
    updatedAt: toTimestamp(collection.updateTime)
  }
}

const isBackendVideoEntity = (value: BackendVideoCollection | BackendVideo): value is BackendVideo => {
  return 'videoUrl' in value || 'duration' in value || 'playCount' in value || 'likeCount' in value
}

const mapVideoEntityToCollection = (video: BackendVideo): VideoCollection => {
  return {
    id: String(video.id ?? ''),
    title: video.title || '',
    description: video.description || '',
    cover: resolveApiUrl(video.coverUrl) || getFallbackCover(video.id ?? ''),
    videos: [mapVideoEntityToVideoFile(video, video.title || '')],
    totalEpisodes: 1,
    playCount: Number(video.playCount ?? 0),
    likeCount: Number(video.likeCount ?? 0),
    collectCount: Number(video.collectCount ?? 0),
    createdAt: toTimestamp(video.createTime),
    updatedAt: toTimestamp(video.updateTime)
  }
}

const mapMixedRecordToCollection = (item: BackendVideoListItem): VideoCollection => {
  if (item.itemType === 'collection' && item.collection) {
    return mapCollectionEntityToCollection(item.collection)
  }
  if (item.itemType === 'video' && item.video) {
    return mapVideoEntityToCollection(item.video)
  }
  if (item.collection) {
    return mapCollectionEntityToCollection(item.collection)
  }
  if (item.video) {
    return mapVideoEntityToCollection(item.video)
  }
  const raw = item as unknown as BackendVideoCollection | BackendVideo
  return isBackendVideoEntity(raw) ? mapVideoEntityToCollection(raw as BackendVideo) : mapCollectionEntityToCollection(raw as BackendVideoCollection)
}

const mapPlayHistoryToRecord = (history: BackendPlayHistory): PlayRecord => {
  return {
    videoId: String(history.videoId ?? ''),
    episodeIndex: 0,
    currentTime: Number(history.progress || 0),
    duration: Number(history.playDuration || 0),
    lastPlayedAt: toTimestamp(history.updateTime || history.createTime),
    playbackRate: history.playbackRate,
    quality: history.quality
  }
}

export interface UploadVideoOptions {
  title?: string
  description?: string
  tags?: string
  categoryId?: number
  categoryName?: string
  coverFile?: File
}

export const videoApi = {
  async getCollectionsPage(pageNum = 1, pageSize = 20): Promise<PageResult<VideoCollection>> {
    const page = await apiRequest.get<PageResult<BackendVideoListItem>>('/api/video/page/mixed', {
      params: { pageNum, pageSize }
    })
    const records = page?.records || []
    return {
      ...page,
      records: records.map((item) => mapMixedRecordToCollection(item))
    }
  },

  async getCollections(pageNum = 1, pageSize = 200): Promise<VideoCollection[]> {
    const page = await videoApi.getCollectionsPage(pageNum, pageSize)
    return page.records || []
  },

  async getCollectionById(id: string): Promise<VideoCollection> {
    const collection = await apiRequest.get<BackendVideoCollection>(`/api/video/collection/${id}`)
    if (!collection || !collection.id) {
      throw new Error('未找到该合集或已被删除')
    }
    const episodes = await apiRequest.get<BackendVideoEpisode[]>(`/api/video/collection/${id}/episodes`)
    return mapCollectionEntityToCollection(collection, episodes)
  },

  async getCollectionEpisodes(id: string): Promise<VideoFile[]> {
    const episodes = await apiRequest.get<BackendVideoEpisode[]>(`/api/video/collection/${id}/episodes`)
    return episodes.map(mapEpisodeToVideoFile)
  },

  updateCollection(id: string, collection: Partial<BackendVideoCollection>): Promise<VideoCollection> {
    return apiRequest.put<BackendVideoCollection>(`/api/video/collection/${id}`, collection).then((result) => {
      return mapCollectionEntityToCollection(result)
    })
  },

  deleteCollection(id: string): Promise<void> {
    return apiRequest.delete<void>(`/api/video/collection/${id}`)
  },

  getVideos(params?: {
    pageNum?: number
    pageSize?: number
    categoryId?: number
    status?: number
    tags?: string
    title?: string
    userId?: number
  }): Promise<PageResult<BackendVideo>> {
    return apiRequest.get<PageResult<BackendVideo>>('/api/video/page', { params })
  },

  getVideoById(id: string): Promise<BackendVideo> {
    return apiRequest.get<BackendVideo>(`/api/video/${id}`)
  },

  updateVideo(id: string, video: Partial<BackendVideo>): Promise<BackendVideo> {
    return apiRequest.put<BackendVideo>(`/api/video/${id}`, video)
  },

  deleteVideo(id: string): Promise<void> {
    return apiRequest.delete<void>(`/api/video/${id}`)
  },

  updateVideoStatus(id: string, status: number, auditRemark?: string): Promise<void> {
    return apiRequest.put<void>(`/api/video/${id}/status`, null, {
      params: { status, auditRemark }
    })
  },

  async uploadVideo(file: File, onProgress?: (progress: number) => void, options?: UploadVideoOptions): Promise<VideoFile> {
    const formData = new FormData()
    formData.append('videoFile', file)
    if (options?.coverFile) {
      formData.append('coverFile', options.coverFile)
    }

    const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : undefined
    const appendField = (key: string, value?: string | number | null) => {
      if (value === undefined || value === null || value === '') return
      formData.append(key, String(value))
    }

    appendField('title', options?.title || file.name)
    appendField('description', options?.description)
    appendField('tags', options?.tags)
    appendField('categoryId', options?.categoryId)
    appendField('categoryName', options?.categoryName)
    appendField('format', fileExtension)
    appendField('fileSize', file.size)

    const result = await apiRequest.upload<BackendVideo>('/api/video/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })

    return mapVideoEntityToVideoFile(result, file.name)
  },

  async uploadVideos(files: File[], onProgress?: (progress: number) => void): Promise<VideoFile[]> {
    const results: VideoFile[] = []
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i]
      const video = await videoApi.uploadVideo(file, (progress) => {
        if (onProgress) {
          const overall = Math.round(((i + progress / 100) / files.length) * 100)
          onProgress(overall)
        }
      })
      results.push(video)
    }
    return results
  },

  uploadVideoChunk(chunk: File, uploadId: string, folder: string, chunkNumber: number, totalChunks: number): Promise<void> {
    const formData = new FormData()
    formData.append('chunk', chunk)
    return apiRequest.upload<void>('/api/video/upload/chunk', formData, {
      params: { uploadId, folder, chunkNumber, totalChunks }
    })
  },

  completeUpload(payload: {
    uploadId: string
    folder: string
    filename: string
    title?: string
    description?: string
    tags?: string
    categoryId?: number
    categoryName?: string
  }): Promise<BackendVideo> {
    return apiRequest.post<BackendVideo>('/api/video/upload/complete', null, {
      params: payload
    })
  },

  getVideoPlaySourceInfo(videoId: string, expireSeconds?: number): Promise<BackendVideoPlaySource> {
    return apiRequest.get<BackendVideoPlaySource>(`/api/video/play/source/${videoId}`, {
      params: { expireSeconds }
    }).then((info) => {
      if (!info) {
        return {
          playUrl: '',
          sourceMode: 'direct',
          processMode: 'none',
          browserFallbackAllowed: false
        }
      }
      const playUrl = info.playUrl && info.playUrl.startsWith('/') ? `${API_BASE_URL}${info.playUrl}` : info.playUrl || ''
      return {
        ...info,
        playUrl
      }
    })
  },

  async getVideoPlayUrl(videoId: string, expireSeconds?: number): Promise<string> {
    const info = await videoApi.getVideoPlaySourceInfo(videoId, expireSeconds)
    return info.playUrl || ''
  }
}

export const playRecordApi = {
  incrementPlayCount(videoId: string): Promise<number> {
    return apiRequest.post<any>(`/api/video/play/count/${videoId}`).then((value) => {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    })
  },

  savePlayRecord(record: PlayRecord): Promise<void> {
    return apiRequest.post<void>('/api/video/play/progress', null, {
      params: {
        videoId: record.videoId,
        progress: Math.round(record.currentTime),
        playDuration: Math.round(record.duration),
        playbackRate: record.playbackRate,
        quality: record.quality
      }
    })
  },

  async getPlayRecord(videoId: string): Promise<PlayRecord | null> {
    const result = await apiRequest.get<BackendPlayHistory>(`/api/video/play/progress/${videoId}`)
    if (!result || !result.videoId) return null
    return mapPlayHistoryToRecord(result)
  },

  getRecentPlayList(size = 10): Promise<BackendVideoPlayHistoryItem[]> {
    return apiRequest.get<BackendVideoPlayHistoryItem[]>('/api/video/play/recent', {
      params: { size }
    })
  }
}

export const videoSearchApi = {
  searchByKeyword(keyword: string, pageNum = 1, pageSize = 10): Promise<PageResult<BackendVideo>> {
    return apiRequest.get<PageResult<BackendVideo>>('/api/video/search/keyword', {
      params: { keyword, pageNum, pageSize }
    })
  },

  searchByTag(tag: string, pageNum = 1, pageSize = 10): Promise<PageResult<BackendVideo>> {
    return apiRequest.get<PageResult<BackendVideo>>('/api/video/search/tag', {
      params: { tag, pageNum, pageSize }
    })
  },

  searchByCategory(categoryId: string, pageNum = 1, pageSize = 10): Promise<PageResult<BackendVideo>> {
    return apiRequest.get<PageResult<BackendVideo>>(`/api/video/search/category/${categoryId}`, {
      params: { pageNum, pageSize }
    })
  },

  getRelatedVideos(videoId: string, limit = 10): Promise<BackendVideo[]> {
    return apiRequest.get<BackendVideo[]>(`/api/video/search/related/${videoId}`, {
      params: { limit }
    })
  },

  getHotVideos(): Promise<BackendVideoListItem[]> {
    return apiRequest.get<BackendVideoListItem[]>('/api/video/search/hot')
  }
}

export const videoStatisticsApi = {
  getHotRanking(): Promise<BackendVideo[]> {
    return apiRequest.get<BackendVideo[]>('/api/video/statistics/hot/ranking')
  },

  getUserBehavior(): Promise<Record<string, any>> {
    return apiRequest.get<Record<string, any>>('/api/video/statistics/user/behavior')
  },

  getVideoStatistics(videoId: string): Promise<Record<string, any>> {
    return apiRequest.get<Record<string, any>>(`/api/video/statistics/video/${videoId}`)
  },

  getVideoTrend(videoId: string, days = 7): Promise<Record<string, number>> {
    return apiRequest.get<Record<string, number>>(`/api/video/statistics/video/${videoId}/trend`, {
      params: { days }
    })
  }
}
