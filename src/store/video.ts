import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VideoCollection, VideoFile, PlayRecord } from '@/types'
import { videoApi, playRecordApi } from '@/api/video'

export const useVideoStore = defineStore('video', () => {
  const collections = ref<VideoCollection[]>([])
  const playRecords = ref<Map<string, PlayRecord>>(new Map())
  const currentCollection = ref<VideoCollection | null>(null)
  const currentVideo = ref<VideoFile | null>(null)
  const scanning = ref(false)

  // 从后端加载所有合集
  const loadCollections = async () => {
    try {
      collections.value = await videoApi.getCollections()
    } catch (error) {
      console.error('Failed to load collections:', error)
      throw error
    }
  }

  // 从后端加载播放记录
  const loadPlayRecords = async () => {
    try {
      const records = await playRecordApi.getAllPlayRecords()
      playRecords.value = new Map(records.map(r => [r.videoId, r]))
    } catch (error) {
      console.error('Failed to load play records:', error)
      // 如果后端不支持，可以降级到本地存储
      const stored = localStorage.getItem('playRecords')
      if (stored) {
        try {
          const records = JSON.parse(stored)
          playRecords.value = new Map(Object.entries(records))
        } catch (e) {
          console.error('Failed to parse stored play records:', e)
        }
      }
    }
  }

  // 保存播放记录到后端
  const savePlayRecord = async (record: PlayRecord) => {
    try {
      await playRecordApi.savePlayRecord(record)
      playRecords.value.set(record.videoId, record)
    } catch (error) {
      console.error('Failed to save play record:', error)
      // 降级到本地存储
      playRecords.value.set(record.videoId, record)
      const recordsObj = Object.fromEntries(playRecords.value)
      localStorage.setItem('playRecords', JSON.stringify(recordsObj))
    }
  }

  // 获取播放记录
  const getPlayRecord = async (videoId: string): Promise<PlayRecord | null> => {
    // 先从内存中查找
    if (playRecords.value.has(videoId)) {
      return playRecords.value.get(videoId) || null
    }
    
    // 从后端加载
    try {
      const record = await playRecordApi.getPlayRecord(videoId)
      if (record) {
        playRecords.value.set(videoId, record)
        return record
      }
    } catch (error) {
      console.error('Failed to get play record:', error)
    }
    
    return null
  }

  // 上传视频文件
  const uploadVideo = async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const video = await videoApi.uploadVideo(file, onProgress)
      // 上传后重新加载合集
      await loadCollections()
      return video
    } catch (error) {
      console.error('Failed to upload video:', error)
      throw error
    }
  }

  // 批量上传视频
  const uploadVideos = async (files: File[], onProgress?: (progress: number) => void) => {
    try {
      const videos = await videoApi.uploadVideos(files, onProgress)
      // 上传后重新加载合集
      await loadCollections()
      return videos
    } catch (error) {
      console.error('Failed to upload videos:', error)
      throw error
    }
  }

  // 扫描文件夹中的视频
  const scanAllVideos = async (folderPaths?: string[]) => {
    scanning.value = true
    try {
      if (!folderPaths || folderPaths.length === 0) {
        // 如果没有指定路径，重新加载合集
        await loadCollections()
        return
      }
      
      // 扫描每个文件夹
      const allVideos: VideoFile[] = []
      for (const path of folderPaths) {
        try {
          const videos = await videoApi.scanFolder(path)
          allVideos.push(...videos)
        } catch (error) {
          console.error(`Failed to scan folder ${path}:`, error)
        }
      }
      
      // 重新加载合集以获取最新的分组
      await loadCollections()
    } catch (error) {
      console.error('Failed to scan videos:', error)
      throw error
    } finally {
      scanning.value = false
    }
  }

  // 设置当前播放的视频
  const setCurrentVideo = (collection: VideoCollection, videoIndex: number) => {
    currentCollection.value = collection
    currentVideo.value = collection.videos[videoIndex]
  }

  // 获取下一个视频
  const getNextVideo = (): { collection: VideoCollection; videoIndex: number } | null => {
    if (!currentCollection.value || !currentVideo.value) return null
    
    const currentIndex = currentCollection.value.videos.findIndex(
      v => v.id === currentVideo.value!.id
    )
    
    if (currentIndex >= 0 && currentIndex < currentCollection.value.videos.length - 1) {
      return {
        collection: currentCollection.value,
        videoIndex: currentIndex + 1
      }
    }
    
    return null
  }

  // 获取视频播放URL
  const getVideoPlayUrl = async (videoId: string): Promise<string> => {
    try {
      const result = await videoApi.getVideoPlayUrl(videoId)
      return result.url
    } catch (error) {
      console.error('Failed to get video play URL:', error)
      throw error
    }
  }

  // 初始化加载
  loadCollections().catch(console.error)
  loadPlayRecords().catch(console.error)

  return {
    collections,
    playRecords,
    currentCollection,
    currentVideo,
    scanning,
    loadCollections,
    loadPlayRecords,
    scanAllVideos,
    savePlayRecord,
    getPlayRecord,
    setCurrentVideo,
    getNextVideo,
    uploadVideo,
    uploadVideos,
    getVideoPlayUrl
  }
})
