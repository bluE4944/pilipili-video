import { openDB, DBSchema, IDBPDatabase } from 'idb'

// IndexedDB Schema
interface VideoDB extends DBSchema {
  videos: {
    key: string
    value: {
      id: string
      name: string
      path: string
      size: number
      modifiedTime: number
      format: string
      duration?: number
      thumbnail?: string
      fileData?: Blob // 存储文件数据（可选，可能很大）
    }
    indexes: { 'by-name': string; 'by-path': string }
  }
  collections: {
    key: string
    value: {
      id: string
      title: string
      description: string
      cover?: string
      videoIds: string[]
      totalEpisodes: number
      createdAt: number
      updatedAt: number
    }
    indexes: { 'by-title': string }
  }
  comments: {
    key: string
    value: {
      id: string
      videoId: string
      collectionId?: string
      userId: string
      username: string
      content: string
      createdAt: number
      replies?: string[]
    }
    indexes: { 'by-videoId': string; 'by-collectionId': string }
  }
}

let db: IDBPDatabase<VideoDB> | null = null

/**
 * 初始化数据库
 */
export async function initDB(): Promise<IDBPDatabase<VideoDB>> {
  if (db) return db

  db = await openDB<VideoDB>('pilipili-video-db', 1, {
    upgrade(db) {
      // 创建videos对象存储
      if (!db.objectStoreNames.contains('videos')) {
        const videoStore = db.createObjectStore('videos', { keyPath: 'id' })
        videoStore.createIndex('by-name', 'name')
        videoStore.createIndex('by-path', 'path')
      }

      // 创建collections对象存储
      if (!db.objectStoreNames.contains('collections')) {
        const collectionStore = db.createObjectStore('collections', { keyPath: 'id' })
        collectionStore.createIndex('by-title', 'title')
      }

      // 创建comments对象存储
      if (!db.objectStoreNames.contains('comments')) {
        const commentStore = db.createObjectStore('comments', { keyPath: 'id' })
        commentStore.createIndex('by-videoId', 'videoId')
        commentStore.createIndex('by-collectionId', 'collectionId')
      }
    }
  })

  return db
}

/**
 * 保存视频文件到IndexedDB
 */
export async function saveVideo(video: VideoDB['videos']['value']): Promise<void> {
  const database = await initDB()
  await database.put('videos', video)
}

/**
 * 批量保存视频文件
 */
export async function saveVideos(videos: VideoDB['videos']['value'][]): Promise<void> {
  const database = await initDB()
  const tx = database.transaction('videos', 'readwrite')
  await Promise.all(videos.map(video => tx.store.put(video)))
  await tx.done
}

/**
 * 获取所有视频
 */
export async function getAllVideos(): Promise<VideoDB['videos']['value'][]> {
  const database = await initDB()
  return database.getAll('videos')
}

/**
 * 根据ID获取视频
 */
export async function getVideoById(id: string): Promise<VideoDB['videos']['value'] | undefined> {
  const database = await initDB()
  return database.get('videos', id)
}

/**
 * 保存合集
 */
export async function saveCollection(collection: VideoDB['collections']['value']): Promise<void> {
  const database = await initDB()
  await database.put('collections', collection)
}

/**
 * 获取所有合集
 */
export async function getAllCollections(): Promise<VideoDB['collections']['value'][]> {
  const database = await initDB()
  return database.getAll('collections')
}

/**
 * 保存评论
 */
export async function saveComment(comment: VideoDB['comments']['value']): Promise<void> {
  const database = await initDB()
  await database.put('comments', comment)
}

/**
 * 获取视频的评论
 */
export async function getCommentsByVideoId(videoId: string): Promise<VideoDB['comments']['value'][]> {
  const database = await initDB()
  return database.getAllFromIndex('comments', 'by-videoId', videoId)
}

/**
 * 获取合集的评论
 */
export async function getCommentsByCollectionId(collectionId: string): Promise<VideoDB['comments']['value'][]> {
  const database = await initDB()
  return database.getAllFromIndex('comments', 'by-collectionId', collectionId)
}
