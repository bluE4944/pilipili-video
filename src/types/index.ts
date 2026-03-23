export interface VideoFile {
  id: string
  name: string
  path: string
  size: number
  modifiedTime: number
  format: string
  duration?: number
  thumbnail?: string
}

export interface VideoCollection {
  id: string
  title: string
  description: string
  cover?: string
  videos: VideoFile[]
  totalEpisodes: number
  createdAt: number
  updatedAt: number
  playCount?: number
  likeCount?: number
  collectCount?: number
}

export interface PlayRecord {
  videoId: string
  collectionId?: string
  episodeIndex: number
  currentTime: number
  duration: number
  lastPlayedAt: number
  playbackRate?: number
  quality?: number
}

export interface FolderConfig {
  id: string
  name: string
  path: string
  enabled: boolean
  createdAt: number
}

export interface User {
  id: string
  username: string
  avatar?: string
  createdAt: number
  email?: string
  phone?: string
  role?: string
}

export interface Comment {
  id: string
  videoId: string
  collectionId?: string
  userId: string
  username: string
  content: string
  createdAt: number
  replies?: Comment[]
}

export type Theme = 'light' | 'dark' | 'auto'

export interface ApiResult<T> {
  status: number
  message: string
  body: T
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
  orders?: BackendOrderItem[]
  searchCount?: boolean
  optimizeCountSql?: boolean
  maxLimit?: number
  countId?: string
}

export interface BackendOrderItem {
  asc?: boolean
  column?: string
}

export interface BackendUser {
  id?: BackendId
  userName?: string
  username?: string
  nikeName?: string
  createTime?: string
  updateTime?: string
  email?: string
  phone?: string
  gender?: string
  role?: string
  authorization?: string
}

export interface UserCondition {
  userName?: string
  password?: string
  email?: string
  phone?: string
  role?: string
  sex?: string
  nikeName?: string
}

export interface LoginResult {
  token: string
  tokenType?: string
  expiresIn?: number
  user?: BackendUser
}

export interface BackendVideo {
  id?: BackendId
  title?: string
  description?: string
  coverUrl?: string
  videoUrl?: string
  duration?: number
  fileSize?: number
  format?: string
  tags?: string
  categoryId?: BackendId
  categoryName?: string
  status?: number
  quality?: number
  playCount?: number
  likeCount?: number
  commentCount?: number
  collectCount?: number
  auditRemark?: string
  userId?: BackendId
  userName?: string
  createTime?: string
  updateTime?: string
}

export type BackendId = number | string

export interface BackendVideoCollection {
  id?: BackendId
  title?: string
  description?: string
  coverUrl?: string
  collectionType?: number
  sourceFolderPath?: string
  enabled?: number
  videoCount?: number
  playCount?: number
  likeCount?: number
  collectCount?: number
  createTime?: string
  updateTime?: string
}

export interface BackendVideoListItem {
  itemType?: 'collection' | 'video'
  collection?: BackendVideoCollection
  video?: BackendVideo
}

export interface BackendVideoEpisode {
  id?: BackendId
  collectionId?: BackendId
  videoId?: BackendId
  episodeName?: string
  episodeNumber?: string
  filePath?: string
  fileSize?: number
  fileFormat?: string
  fileModifyTime?: string
  sortOrder?: number
  createTime?: string
  updateTime?: string
}

export interface BackendPlayHistory {
  id?: BackendId
  videoId?: BackendId
  userId?: BackendId
  progress?: number
  playDuration?: number
  playbackRate?: number
  quality?: number
  createTime?: string
  updateTime?: string
}

export interface BackendVideoPlayHistoryItem {
  history?: BackendPlayHistory
  itemType?: 'collection' | 'video'
  collection?: BackendVideoCollection
  video?: BackendVideo
}

export interface BackendVideoPlaySource {
  playUrl?: string
  sourceMode?: 'direct' | 'compatible_mp4' | 'hls' | 'browser_compat'
  processMode?: 'none' | 'remux' | 'audio_transcode' | 'full_transcode'
  browserFallbackAllowed?: boolean
}

export interface BackendComment {
  id?: BackendId
  videoId?: BackendId
  userId?: BackendId
  userName?: string
  userAvatar?: string
  content?: string
  likeCount?: number
  parentId?: BackendId
  replyCount?: number
  createTime?: string
  updateTime?: string
}

export interface BackendDanmaku {
  id?: BackendId
  videoId?: BackendId
  userId?: BackendId
  content?: string
  color?: string
  fontSize?: number
  time?: number
  type?: number
  createTime?: string
  updateTime?: string
}

export interface BackendVideoCollect {
  id?: BackendId
  videoId?: BackendId
  userId?: BackendId
  folderName?: string
  createTime?: string
  updateTime?: string
}

export interface BackendFolderConfig {
  id?: BackendId
  configName?: string
  folderPath?: string
  enabled?: number
  scanInterval?: number
  scanStatus?: number
  lastScanTime?: string
  remark?: string
  machineIp?: string
  createTime?: string
  updateTime?: string
}

export interface BackendSystemConfig {
  id?: BackendId
  configKey?: string
  configType?: number
  configValue?: string
  description?: string
  createTime?: string
  updateTime?: string
}

export interface BackendDict {
  id?: BackendId
  dictCode?: string
  dictName?: string
  description?: string
  enabled?: number
  sortOrder?: number
  createTime?: string
  updateTime?: string
}

export interface BackendDictItem {
  id?: BackendId
  dictCode?: string
  itemValue?: string
  itemLabel?: string
  sortOrder?: number
  enabled?: number
  remark?: string
  createTime?: string
  updateTime?: string
}

export interface BlogComment {
  id: string
  username: string
  content: string
  createdAt: number
  likes: number
}

export interface Blog {
  id: string
  title: string
  summary: string
  contentMarkdown: string
  contentHtml: string
  createdAt: number
  views: number
  likes: number
  liked: boolean
  comments: BlogComment[]
}
