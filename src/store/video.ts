import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VideoCollection, VideoFile, PlayRecord, BackendVideoPlayHistoryItem, BackendVideoPlaySource } from '@/types'
import { videoApi, playRecordApi } from '@/api/video'
import { folderApi } from '@/api/folder'

export const useVideoStore = defineStore('video', () => {
  const collections = ref<VideoCollection[]>([])
  const playRecords = ref<Map<string, PlayRecord>>(new Map())
  const recentPlayList = ref<BackendVideoPlayHistoryItem[]>([])
  const currentCollection = ref<VideoCollection | null>(null)
  const currentVideo = ref<VideoFile | null>(null)
  const scanning = ref(false)

  const loadCollections = async () => {
    try {
      const latest = await videoApi.getCollections()
      const existingMap = new Map(collections.value.map(item => [item.id, item]))
      collections.value = latest.map((item) => {
        const existing = existingMap.get(item.id)
        if (existing && existing.videos.length > 0) {
          return {
            ...item,
            videos: existing.videos,
            totalEpisodes: item.totalEpisodes || existing.totalEpisodes
          }
        }
        return item
      })
    } catch (error) {
      console.error('Failed to load collections:', error)
      throw error
    }
  }

  const loadCollectionDetail = async (collectionId: string) => {
    try {
      const collection = await videoApi.getCollectionById(collectionId)
      const index = collections.value.findIndex(item => item.id === collection.id)
      if (index >= 0) {
        collections.value[index] = collection
      } else {
        collections.value.push(collection)
      }
      if (currentCollection.value && currentCollection.value.id === collection.id) {
        currentCollection.value = collection
      }
      return collection
    } catch (error) {
      console.error('Failed to load collection detail:', error)
      throw error
    }
  }

  const savePlayRecord = async (record: PlayRecord) => {
    try {
      await playRecordApi.savePlayRecord(record)
      playRecords.value.set(record.videoId, record)
    } catch (error) {
      console.error('Failed to save play record:', error)
    }
  }

  const getPlayRecord = async (videoId: string): Promise<PlayRecord | null> => {
    if (playRecords.value.has(videoId)) {
      return playRecords.value.get(videoId) || null
    }

    try {
      const record = await playRecordApi.getPlayRecord(videoId)
      if (record) {
        const merged: PlayRecord = {
          ...record,
          collectionId: record.collectionId,
          episodeIndex: record.episodeIndex || 0
        }
        playRecords.value.set(videoId, merged)
        return merged
      }
    } catch (error) {
      console.error('Failed to get play record:', error)
    }

    return null
  }

  const getPlayRecordByCollection = async (collection: VideoCollection): Promise<PlayRecord | null> => {
    if (!collection || !collection.id || collection.videos.length === 0) return null
    try {
      const record = await playRecordApi.getPlayRecord(collection.id)
      if (record && record.videoId) {
        const index = collection.videos.findIndex(video => video.id === record.videoId)
        const merged: PlayRecord = {
          ...record,
          collectionId: collection.id,
          episodeIndex: index >= 0 ? index : 0
        }
        playRecords.value.set(record.videoId, merged)
        return merged
      }
    } catch (error) {
      console.error('Failed to get play record by collection:', error)
    }
    return null
  }

  const loadRecentPlayList = async (size = 10) => {
    try {
      const items = await playRecordApi.getRecentPlayList(size)
      recentPlayList.value = items || []
      return recentPlayList.value
    } catch (error) {
      console.error('Failed to load recent play list:', error)
      recentPlayList.value = []
      return recentPlayList.value
    }
  }

  const uploadVideo = async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const video = await videoApi.uploadVideo(file, onProgress)
      await loadCollections()
      return video
    } catch (error) {
      console.error('Failed to upload video:', error)
      throw error
    }
  }

  const uploadVideos = async (files: File[], onProgress?: (progress: number) => void) => {
    try {
      const videos = await videoApi.uploadVideos(files, onProgress)
      await loadCollections()
      return videos
    } catch (error) {
      console.error('Failed to upload videos:', error)
      throw error
    }
  }

  const scanAllVideos = async (configIds?: string[]) => {
    scanning.value = true
    try {
      let ids = configIds
      if (!ids || ids.length === 0) {
        const enabled = await folderApi.getEnabledFolders()
        ids = enabled.map(item => item.id)
      }

      if (!ids || ids.length === 0) {
        return
      }

      for (const id of ids) {
        try {
          await folderApi.scanFolder(id)
        } catch (error) {
          console.error(`Failed to scan folder config ${id}:`, error)
        }
      }

      await loadCollections()
    } catch (error) {
      console.error('Failed to scan videos:', error)
      throw error
    } finally {
      scanning.value = false
    }
  }

  const setCurrentVideo = (collection: VideoCollection, videoIndex: number) => {
    currentCollection.value = collection
    currentVideo.value = collection.videos[videoIndex]
  }

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

  const getVideoPlaySourceInfo = async (videoId: string): Promise<BackendVideoPlaySource> => {
    try {
      return await videoApi.getVideoPlaySourceInfo(videoId)
    } catch (error) {
      console.error('Failed to get video play source info:', error)
      throw error
    }
  }

  const getVideoPlayUrl = async (videoId: string): Promise<string> => {
    const result = await getVideoPlaySourceInfo(videoId)
    return result.playUrl || ''
  }

  loadCollections().catch(console.error)

  return {
    collections,
    playRecords,
    recentPlayList,
    currentCollection,
    currentVideo,
    scanning,
    loadCollections,
    loadCollectionDetail,
    loadRecentPlayList,
    scanAllVideos,
    savePlayRecord,
    getPlayRecord,
    getPlayRecordByCollection,
    setCurrentVideo,
    getNextVideo,
    uploadVideo,
    uploadVideos,
    getVideoPlaySourceInfo,
    getVideoPlayUrl
  }
})
