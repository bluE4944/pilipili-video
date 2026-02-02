import { apiRequest } from '@/utils/api'
import type { VideoFile, VideoCollection, PlayRecord } from '@/types'

// 视频相关 API
export const videoApi = {
  // 获取所有视频合集
  getCollections(): Promise<VideoCollection[]> {
    return apiRequest.get<VideoCollection[]>('/api/video/collections')
  },

  // 根据ID获取合集详情
  getCollectionById(id: string): Promise<VideoCollection> {
    return apiRequest.get<VideoCollection>(`/api/video/collections/${id}`)
  },

  // 获取所有视频
  getVideos(): Promise<VideoFile[]> {
    return apiRequest.get<VideoFile[]>('/api/video/videos')
  },

  // 根据ID获取视频
  getVideoById(id: string): Promise<VideoFile> {
    return apiRequest.get<VideoFile>(`/api/video/videos/${id}`)
  },

  // 上传视频文件
  uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<VideoFile> {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiRequest.upload<VideoFile>('/api/video/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  },

  // 批量上传视频
  uploadVideos(files: File[], onProgress?: (progress: number) => void): Promise<VideoFile[]> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    
    return apiRequest.upload<VideoFile[]>('/api/video/upload/batch', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  },

  // 扫描文件夹中的视频
  scanFolder(folderPath: string): Promise<VideoFile[]> {
    return apiRequest.post<VideoFile[]>('/api/video/scan', { folderPath })
  },

  // 获取视频播放URL（用于播放）
  getVideoPlayUrl(videoId: string): Promise<{ url: string }> {
    return apiRequest.get<{ url: string }>(`/api/video/videos/${videoId}/play-url`)
  }
}

// 播放记录相关 API
export const playRecordApi = {
  // 保存播放记录
  savePlayRecord(record: PlayRecord): Promise<void> {
    return apiRequest.post<void>('/api/video/play-records', record)
  },

  // 获取播放记录
  getPlayRecord(videoId: string): Promise<PlayRecord | null> {
    return apiRequest.get<PlayRecord | null>(`/api/video/play-records/${videoId}`)
  },

  // 获取所有播放记录
  getAllPlayRecords(): Promise<PlayRecord[]> {
    return apiRequest.get<PlayRecord[]>('/api/video/play-records')
  },

  // 删除播放记录
  deletePlayRecord(videoId: string): Promise<void> {
    return apiRequest.delete<void>(`/api/video/play-records/${videoId}`)
  }
}
