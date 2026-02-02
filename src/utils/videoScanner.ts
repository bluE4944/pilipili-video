import type { VideoFile, VideoCollection } from '@/types'

// 支持的视频格式
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.flv', '.mov', '.wmv', '.webm', '.m4v']

/**
 * 检查文件是否为视频文件
 */
export function isVideoFile(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return VIDEO_EXTENSIONS.includes(ext)
}

/**
 * 从文件名提取集数
 */
export function extractEpisodeNumber(filename: string): number | null {
  // 匹配常见的集数格式：01, 02, 第1集, 第01集, EP01, ep01等
  const patterns = [
    /[第]?(\d+)[集话話]/,
    /[eE][pP](\d+)/i,
    /[\[\(](\d+)[\]\)]/,
    /[_-](\d{2,})[_-]/,
    /(\d{2,})/
  ]

  for (const pattern of patterns) {
    const match = filename.match(pattern)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > 0 && num < 1000) {
        return num
      }
    }
  }

  return null
}

/**
 * 提取合集标题（去除集数标识）
 */
export function extractCollectionTitle(filename: string): string {
  // 移除常见的集数标识
  let title = filename
    .replace(/[第]?\d+[集话話]/g, '')
    .replace(/[eE][pP]\d+/gi, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\(\d+\)/g, '')
    .replace(/[_-]\d{2,}[_-]/g, '')
    .replace(/\.(mp4|mkv|avi|flv|mov|wmv|webm|m4v)$/i, '')
    .trim()

  // 清理多余的分隔符
  title = title.replace(/[_-]+/g, ' ').trim()

  return title || filename
}

/**
 * 判断两个文件名是否属于同一合集
 */
export function isSameCollection(file1: string, file2: string): boolean {
  const title1 = extractCollectionTitle(file1)
  const title2 = extractCollectionTitle(file2)
  
  // 简单的相似度判断（可以后续优化为更智能的算法）
  const similarity = calculateSimilarity(title1, title2)
  return similarity > 0.6
}

/**
 * 计算字符串相似度（简单的Levenshtein距离归一化）
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Levenshtein距离算法
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * 扫描视频文件（从File对象列表）
 * 注意：由于浏览器安全限制，无法直接访问本地文件系统
 * 此函数处理用户通过文件选择器选择的文件
 */
export async function scanVideosFromFiles(files: File[]): Promise<VideoFile[]> {
  const videoFiles: VideoFile[] = []

  for (const file of files) {
    if (isVideoFile(file.name)) {
      // 使用更唯一的ID，包含文件名、大小、修改时间和索引
      const index = videoFiles.length
      const videoFile: VideoFile = {
        id: `video_${file.name}_${file.size}_${file.lastModified}_${index}_${Date.now()}`,
        name: file.name,
        path: file.name, // 浏览器环境下只能使用文件名
        size: file.size,
        modifiedTime: file.lastModified,
        format: file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
      }

      // 尝试获取视频时长（需要创建video元素）
      try {
        const duration = await getVideoDuration(file)
        videoFile.duration = duration
      } catch (e) {
        console.warn(`Failed to get duration for ${file.name}:`, e)
      }

      videoFiles.push(videoFile)
    }
  }

  return videoFiles
}

/**
 * 获取视频时长
 */
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    let blobUrl: string | null = null
    
    const cleanup = () => {
      if (blobUrl) {
        try {
          URL.revokeObjectURL(blobUrl)
        } catch (e) {
          console.warn('Error revoking blob URL:', e)
        }
        blobUrl = null
      }
      video.remove()
    }
    
    video.onloadedmetadata = () => {
      const duration = video.duration
      cleanup()
      resolve(duration)
    }
    
    video.onerror = () => {
      cleanup()
      reject(new Error('Failed to load video metadata'))
    }
    
    try {
      blobUrl = URL.createObjectURL(file)
      video.src = blobUrl
    } catch (error) {
      cleanup()
      reject(new Error('Failed to create blob URL: ' + (error as Error).message))
    }
  })
}

/**
 * 将视频文件分组为合集
 */
export function groupVideosIntoCollections(videos: VideoFile[]): VideoCollection[] {
  const collections: VideoCollection[] = []
  const processed = new Set<string>()

  for (const video of videos) {
    if (processed.has(video.id)) continue

    // 查找相似的文件
    const similarVideos = videos.filter(v => 
      !processed.has(v.id) && isSameCollection(video.name, v.name)
    )

    // 按集数排序
    similarVideos.sort((a, b) => {
      const epA = extractEpisodeNumber(a.name) ?? 9999
      const epB = extractEpisodeNumber(b.name) ?? 9999
      return epA - epB
    })

    // 创建合集
    const collectionTitle = extractCollectionTitle(video.name)
    const collection: VideoCollection = {
      id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: collectionTitle,
      description: `共 ${similarVideos.length} 集`,
      videos: similarVideos,
      totalEpisodes: similarVideos.length,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    collections.push(collection)

    // 标记为已处理
    similarVideos.forEach(v => processed.add(v.id))
  }

  return collections
}

/**
 * 扫描视频（从文件夹路径）
 * 注意：此函数需要后端支持或Electron环境
 * 前端版本使用IndexedDB存储已扫描的视频元数据
 * 
 * 在浏览器环境下，此函数无法直接访问文件系统
 * 建议使用文件选择器（scanVideosFromFiles）或后端API
 */
export async function scanVideos(_folderPaths: string[]): Promise<VideoFile[]> {
  // 由于浏览器安全限制，无法直接访问文件系统
  // 这里返回空数组，实际实现需要：
  // 1. 后端API提供文件列表
  // 2. 或使用Electron等桌面应用框架
  // 3. 或使用File System Access API（需要用户授权，Chrome/Edge支持）
  
  // 不输出警告，因为这是预期的行为
  // console.warn('Direct file system access is not available in browser. Please use file picker or backend API.')
  
  // 从IndexedDB加载已存储的视频元数据（如果有）
  return loadVideosFromIndexedDB()
}

/**
 * 从IndexedDB加载视频数据
 * 注意：此函数只加载元数据，不包含文件对象
 * 文件对象需要用户重新选择
 */
async function loadVideosFromIndexedDB(): Promise<VideoFile[]> {
  try {
    const { getAllVideos } = await import('@/utils/storage')
    const videos = await getAllVideos()
    // 只返回元数据，不包含文件对象
    return videos.map(v => ({
      id: v.id,
      name: v.name,
      path: v.path,
      size: v.size,
      modifiedTime: v.modifiedTime,
      format: v.format,
      duration: v.duration,
      thumbnail: v.thumbnail
    }))
  } catch (error) {
    console.warn('Failed to load videos from IndexedDB:', error)
    return []
  }
}
