import { apiRequest } from '@/utils/api'
import type { BackendUser, BackendVideo, BackendVideoCollection, BackendVideoEpisode, PageResult } from '@/types'

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
  videoIds: number[]
  title?: string
  categoryId?: number
  categoryName?: string
  tags?: string
}

export interface AdminBatchCollectionUpdatePayload {
  collectionIds: number[]
  title?: string
  description?: string
}

export interface AdminEpisodeUpdateItem {
  id: number
  episodeNumber?: string
  episodeName?: string
  sortOrder?: number
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

  deleteUsers(ids: number[]): Promise<void> {
    return apiRequest.delete<void>('/api/admin/users/batch', { data: ids })
  },

  updateUserRoles(ids: number[], role: string, authorization?: string): Promise<void> {
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

  updateVideoStatusBatch(ids: number[], status: number, auditRemark?: string): Promise<void> {
    return apiRequest.put<void>('/api/admin/videos/batch/status', ids, {
      params: { status, auditRemark }
    })
  },

  updateVideoFieldsBatch(payload: AdminBatchVideoUpdatePayload): Promise<void> {
    return apiRequest.put<void>('/api/admin/videos/batch/fields', payload)
  },

  deleteVideos(ids: number[]): Promise<void> {
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

  updateCollectionEnabledBatch(ids: number[], enabled: number): Promise<void> {
    return apiRequest.put<void>('/api/admin/collections/batch/enabled', ids, {
      params: { enabled }
    })
  },

  updateCollectionFieldsBatch(payload: AdminBatchCollectionUpdatePayload): Promise<void> {
    return apiRequest.put<void>('/api/admin/collections/batch/fields', payload)
  },

  deleteCollections(ids: number[]): Promise<void> {
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

  deleteCollectionEpisodes(collectionId: number | string, episodeIds: number[]): Promise<void> {
    return apiRequest.delete<void>(`/api/admin/collections/${collectionId}/episodes/batch`, { data: episodeIds })
  },

  updateCollectionEpisodeSort(collectionId: number | string, items: AdminEpisodeUpdateItem[]): Promise<void> {
    return apiRequest.put<void>(`/api/admin/collections/${collectionId}/episodes/sort`, items)
  },

  updateCollectionEpisodes(collectionId: number | string, items: AdminEpisodeUpdateItem[]): Promise<void> {
    return apiRequest.put<void>(`/api/admin/collections/${collectionId}/episodes/batch`, items)
  }
}
