import { apiRequest } from '@/utils/api'
import type {
  BackendId,
  BackendDict,
  BackendDictItem,
  BackendUser,
  BackendVideo,
  BackendVideoCollection,
  BackendVideoEpisode,
  PageResult
} from '@/types'

export interface AdminUserPayload {
  userName?: string
  password?: string
  nikeName?: string
  email?: string
  phone?: string
  role?: string
  authorization?: string
  sex?: string
}

export interface AdminBatchVideoUpdatePayload {
  videoIds: BackendId[]
  title?: string
  categoryId?: number
  categoryName?: string
  tags?: string
}

export interface AdminBatchCollectionUpdatePayload {
  collectionIds: BackendId[]
  title?: string
  description?: string
}

export interface AdminCollectionPayload {
  title?: string
  description?: string
  coverUrl?: string
  sourceFolderPath?: string
  collectionType?: number
  enabled?: number
  videoCount?: number
}

export interface AdminEpisodeUpdateItem {
  id: BackendId
  episodeNumber?: string
  episodeName?: string
  sortOrder?: number
}

export interface AdminDictPayload {
  dictCode?: string
  dictName?: string
  description?: string
  enabled?: number
  sortOrder?: number
}

export interface AdminDictItemPayload {
  itemValue?: string
  itemLabel?: string
  sortOrder?: number
  enabled?: number
  remark?: string
}


export type AdminTranscodeTargetType = 'video' | 'collection'
export type AdminTranscodeOutputMode = 'replace_original' | 'switch_path_only'
export type AdminTranscodeTaskStatus = 'queued' | 'running' | 'success' | 'partial_success' | 'failed'
export type AdminTranscodeTaskItemStatus = 'queued' | 'running' | 'success' | 'skipped' | 'failed'

export interface AdminCreateTranscodeTaskPayload {
  targetType: AdminTranscodeTargetType
  targetIds: BackendId[]
  outputMode: AdminTranscodeOutputMode
}

export interface AdminTranscodeTaskItem {
  index?: number
  sourcePath?: string
  outputPath?: string
  status?: AdminTranscodeTaskItemStatus
  progress?: number
  message?: string
}

export interface AdminTranscodeTaskSummary {
  taskId?: BackendId
  targetType?: AdminTranscodeTargetType
  outputMode?: AdminTranscodeOutputMode
  status?: AdminTranscodeTaskStatus
  totalFileCount?: number
  successCount?: number
  failedCount?: number
  skippedCount?: number
  currentFile?: string
  currentFileProgress?: number
  totalProgress?: number
  createTime?: string
  updateTime?: string
}

export interface AdminTranscodeTaskDetail extends AdminTranscodeTaskSummary {
  items?: AdminTranscodeTaskItem[]
}

export type AdminDownloadTaskStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'failed'
export type AdminDownloadAutoImportStatus = 'pending' | 'running' | 'success' | 'failed'
export type AdminDownloadSourceType = 'magnet' | 'torrent'

export interface AdminCreateDownloadMagnetTaskPayload {
  magnetUrl: string
  folderConfigId: BackendId
  addPaused?: boolean
}

export interface AdminDownloadTask {
  taskId?: BackendId
  taskTag?: string
  torrentHash?: string
  sourceType?: AdminDownloadSourceType
  sourceName?: string
  folderConfigId?: BackendId
  folderConfigName?: string
  savePath?: string
  category?: string
  qbtState?: string
  status?: AdminDownloadTaskStatus
  progress?: number
  downloadedBytes?: number
  totalBytes?: number
  downloadSpeed?: number
  etaSeconds?: number
  errorMessage?: string
  autoImportStatus?: AdminDownloadAutoImportStatus
  autoImportMessage?: string
  lastSyncedAt?: string
  createTime?: string
  updateTime?: string
}

export interface AdminDownloadStatus {
  connected?: boolean
  message?: string
  version?: string
  defaultCategory?: string
  defaultSavePath?: string
  pollIntervalSeconds?: number
  lastCheckedAt?: string
}

export const adminApi = {
  getUsersPage(params?: {
    pageNum?: number
    pageSize?: number
    userName?: string
    nikeName?: string
    email?: string
    phone?: string
    role?: string
    authorization?: string
  }): Promise<PageResult<BackendUser>> {
    return apiRequest.get<PageResult<BackendUser>>('/api/admin/users/page', { params })
  },

  getUserById(id: number | string): Promise<BackendUser> {
    return apiRequest.get<BackendUser>(`/api/admin/users/${id}`)
  },

  createUser(payload: AdminUserPayload): Promise<BackendUser> {
    return apiRequest.post<BackendUser>('/api/admin/users', payload)
  },

  updateUser(id: number | string, payload: AdminUserPayload): Promise<BackendUser> {
    return apiRequest.put<BackendUser>(`/api/admin/users/${id}`, payload)
  },

  deleteUser(id: number | string): Promise<void> {
    return apiRequest.delete<void>(`/api/admin/users/${id}`)
  },

  deleteUsers(ids: BackendId[]): Promise<void> {
    return apiRequest.delete<void>('/api/admin/users/batch', { data: ids })
  },

  updateUserRoles(ids: BackendId[], role: string, authorization?: string): Promise<void> {
    return apiRequest.put<void>('/api/admin/users/batch/role', ids, {
      params: { role, authorization }
    })
  },

  getVideosPage(params?: {
    pageNum?: number
    pageSize?: number
    categoryId?: number
    status?: number
    tags?: string
    title?: string
    userId?: number
  }): Promise<PageResult<BackendVideo>> {
    return apiRequest.get<PageResult<BackendVideo>>('/api/admin/videos/page', { params })
  },

  updateVideoStatusBatch(ids: BackendId[], status: number, auditRemark?: string): Promise<void> {
    return apiRequest.put<void>('/api/admin/videos/batch/status', ids, {
      params: { status, auditRemark }
    })
  },

  updateVideoFieldsBatch(payload: AdminBatchVideoUpdatePayload): Promise<void> {
    return apiRequest.put<void>('/api/admin/videos/batch/fields', payload)
  },

  deleteVideos(ids: BackendId[]): Promise<void> {
    return apiRequest.delete<void>('/api/admin/videos/batch', { data: ids })
  },

  uploadVideoCover(videoId: number | string, file: File): Promise<BackendVideo> {
    const formData = new FormData()
    formData.append('coverFile', file)
    return apiRequest.upload<BackendVideo>(`/api/admin/videos/${videoId}/cover`, formData)
  },

  getCollectionsPage(params?: {
    pageNum?: number
    pageSize?: number
    title?: string
    collectionType?: number
    enabled?: number
  }): Promise<PageResult<BackendVideoCollection>> {
    return apiRequest.get<PageResult<BackendVideoCollection>>('/api/admin/collections/page', { params })
  },

  createCollection(payload: AdminCollectionPayload): Promise<BackendVideoCollection> {
    return apiRequest.post<BackendVideoCollection>('/api/admin/collections', payload)
  },

  updateCollectionEnabledBatch(ids: BackendId[], enabled: number): Promise<void> {
    return apiRequest.put<void>('/api/admin/collections/batch/enabled', ids, {
      params: { enabled }
    })
  },

  updateCollectionFieldsBatch(payload: AdminBatchCollectionUpdatePayload): Promise<void> {
    return apiRequest.put<void>('/api/admin/collections/batch/fields', payload)
  },

  deleteCollections(ids: BackendId[]): Promise<void> {
    return apiRequest.delete<void>('/api/admin/collections/batch', { data: ids })
  },

  uploadCollectionCover(collectionId: number | string, file: File): Promise<BackendVideoCollection> {
    const formData = new FormData()
    formData.append('coverFile', file)
    return apiRequest.upload<BackendVideoCollection>(`/api/admin/collections/${collectionId}/cover`, formData)
  },

  getCollectionEpisodes(collectionId: number | string): Promise<BackendVideoEpisode[]> {
    return apiRequest.get<BackendVideoEpisode[]>(`/api/admin/collections/${collectionId}/episodes`)
  },

  deleteCollectionEpisodes(collectionId: number | string, episodeIds: BackendId[]): Promise<void> {
    return apiRequest.delete<void>(`/api/admin/collections/${collectionId}/episodes/batch`, { data: episodeIds })
  },

  updateCollectionEpisodeSort(collectionId: number | string, items: AdminEpisodeUpdateItem[]): Promise<void> {
    return apiRequest.put<void>(`/api/admin/collections/${collectionId}/episodes/sort`, items)
  },

  updateCollectionEpisodes(collectionId: number | string, items: AdminEpisodeUpdateItem[]): Promise<void> {
    return apiRequest.put<void>(`/api/admin/collections/${collectionId}/episodes/batch`, items)
  },


  createTranscodeTask(payload: AdminCreateTranscodeTaskPayload): Promise<AdminTranscodeTaskSummary> {
    return apiRequest.post<AdminTranscodeTaskSummary>('/api/admin/transcode/tasks', payload)
  },

  getTranscodeTasks(): Promise<AdminTranscodeTaskSummary[]> {
    return apiRequest.get<AdminTranscodeTaskSummary[]>('/api/admin/transcode/tasks')
  },

  getTranscodeTaskDetail(taskId: number | string): Promise<AdminTranscodeTaskDetail> {
    return apiRequest.get<AdminTranscodeTaskDetail>(`/api/admin/transcode/tasks/${taskId}`)
  },

  createDownloadMagnetTask(payload: AdminCreateDownloadMagnetTaskPayload): Promise<AdminDownloadTask> {
    return apiRequest.post<AdminDownloadTask>('/api/admin/download/tasks/magnet', payload)
  },

  createDownloadTorrentTask(file: File, folderConfigId: BackendId, addPaused?: boolean): Promise<AdminDownloadTask> {
    const formData = new FormData()
    formData.append('torrentFile', file)
    formData.append('folderConfigId', String(folderConfigId))
    formData.append('addPaused', String(Boolean(addPaused)))
    return apiRequest.upload<AdminDownloadTask>('/api/admin/download/tasks/torrent', formData)
  },

  getDownloadTasks(): Promise<AdminDownloadTask[]> {
    return apiRequest.get<AdminDownloadTask[]>('/api/admin/download/tasks')
  },

  getDownloadTaskDetail(taskId: number | string): Promise<AdminDownloadTask> {
    return apiRequest.get<AdminDownloadTask>(`/api/admin/download/tasks/${taskId}`)
  },

  pauseDownloadTask(taskId: number | string): Promise<void> {
    return apiRequest.post<void>(`/api/admin/download/tasks/${taskId}/pause`)
  },

  resumeDownloadTask(taskId: number | string): Promise<void> {
    return apiRequest.post<void>(`/api/admin/download/tasks/${taskId}/resume`)
  },

  deleteDownloadTask(taskId: number | string, deleteFiles = false): Promise<void> {
    return apiRequest.delete<void>(`/api/admin/download/tasks/${taskId}`, {
      params: { deleteFiles }
    })
  },

  retryDownloadTaskImport(taskId: number | string): Promise<AdminDownloadTask> {
    return apiRequest.post<AdminDownloadTask>(`/api/admin/download/tasks/${taskId}/retry-import`)
  },

  getDownloadStatus(): Promise<AdminDownloadStatus> {
    return apiRequest.get<AdminDownloadStatus>('/api/admin/download/status')
  },

  getDictPage(params?: {
    pageNum?: number
    pageSize?: number
    dictCode?: string
    dictName?: string
    enabled?: number
  }): Promise<PageResult<BackendDict>> {
    return apiRequest.get<PageResult<BackendDict>>('/api/admin/dict/page', { params })
  },

  getDictById(dictId: number | string): Promise<BackendDict> {
    return apiRequest.get<BackendDict>(`/api/admin/dict/${dictId}`)
  },

  createDict(payload: AdminDictPayload): Promise<BackendDict> {
    return apiRequest.post<BackendDict>('/api/admin/dict', payload)
  },

  updateDict(dictId: number | string, payload: AdminDictPayload): Promise<BackendDict> {
    return apiRequest.put<BackendDict>(`/api/admin/dict/${dictId}`, payload)
  },

  deleteDict(dictId: number | string): Promise<void> {
    return apiRequest.delete<void>(`/api/admin/dict/${dictId}`)
  },

  deleteDicts(dictIds: BackendId[]): Promise<void> {
    return apiRequest.delete<void>('/api/admin/dict/batch', { data: dictIds })
  },

  getDictItems(dictCode: string): Promise<BackendDictItem[]> {
    return apiRequest.get<BackendDictItem[]>(`/api/admin/dict/${dictCode}/items`)
  },

  createDictItem(dictCode: string, payload: AdminDictItemPayload): Promise<BackendDictItem> {
    return apiRequest.post<BackendDictItem>(`/api/admin/dict/${dictCode}/items`, payload)
  },

  updateDictItem(itemId: number | string, payload: AdminDictItemPayload): Promise<BackendDictItem> {
    return apiRequest.put<BackendDictItem>(`/api/admin/dict/items/${itemId}`, payload)
  },

  deleteDictItem(itemId: number | string): Promise<void> {
    return apiRequest.delete<void>(`/api/admin/dict/items/${itemId}`)
  },

  deleteDictItems(itemIds: BackendId[]): Promise<void> {
    return apiRequest.delete<void>('/api/admin/dict/items/batch', { data: itemIds })
  }
}
