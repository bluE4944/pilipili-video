// 视频文件管理器 - 管理内存中的文件对象

// 存储文件对象到内存（Map）
// 使用 WeakMap 可能导致文件被垃圾回收，所以使用 Map
const fileCache = new Map<string, File>()

// 调试：获取所有缓存的视频ID
export function getCachedVideoIds(): string[] {
  return Array.from(fileCache.keys())
}

/**
 * 注册视频文件（从文件选择器）
 * 注意：File 对象会被保存在 Map 中，不会被垃圾回收
 */
export function registerVideoFile(videoId: string, file: File): void {
  if (!(file instanceof File)) {
    console.error('Invalid file object:', file)
    return
  }
  if (file.size === 0) {
    console.warn('File size is 0:', file.name)
  }
  fileCache.set(videoId, file)
  console.log(`📁 Registered file: ${file.name} -> ${videoId}`)
}

/**
 * 获取视频文件的Blob URL
 */
export function getVideoBlobUrl(videoId: string): string | null {
  const file = fileCache.get(videoId)
  if (file) {
    return URL.createObjectURL(file)
  }
  return null
}

/**
 * 释放Blob URL
 */
export function revokeVideoBlobUrl(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * 根据视频ID获取File对象
 */
export function getVideoFile(videoId: string): File | null {
  return fileCache.get(videoId) || null
}

/**
 * 清理所有Blob URL
 */
export function cleanupAllBlobUrls(): void {
  // 注意：实际应用中应该跟踪所有创建的URL并逐一释放
  // 这里简化处理
}
