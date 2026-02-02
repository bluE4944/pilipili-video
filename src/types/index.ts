// 视频文件类型
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

// 视频合集类型
export interface VideoCollection {
  id: string
  title: string
  description: string
  cover?: string
  videos: VideoFile[]
  totalEpisodes: number
  createdAt: number
  updatedAt: number
}

// 播放记录类型
export interface PlayRecord {
  videoId: string
  collectionId?: string
  episodeIndex: number
  currentTime: number // 秒
  duration: number
  lastPlayedAt: number
}

// 文件夹配置类型
export interface FolderConfig {
  id: string
  name: string
  path: string
  enabled: boolean
  createdAt: number
}

// 用户类型
export interface User {
  id: string
  username: string
  avatar?: string
  createdAt: number
}

// 评论类型
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

// 主题类型
export type Theme = 'light' | 'dark' | 'auto'
