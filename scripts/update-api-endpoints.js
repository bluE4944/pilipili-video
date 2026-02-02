/**
 * API 端点更新脚本
 * 
 * 使用方法：
 * 1. 查看 Swagger 文档 (http://localhost:8316/swagger-ui.html)
 * 2. 记录实际的 API 端点路径
 * 3. 修改下面的 API_ENDPOINTS 对象
 * 4. 运行: node scripts/update-api-endpoints.js
 */

const fs = require('fs')
const path = require('path')

// 根据 Swagger 文档填写实际的 API 端点
const API_ENDPOINTS = {
  // 视频相关
  video: {
    collections: '/api/video/collections',  // 修改为实际路径
    collectionById: '/api/video/collections/:id',
    videos: '/api/video/videos',
    videoById: '/api/video/videos/:id',
    upload: '/api/video/upload',
    uploadBatch: '/api/video/upload/batch',
    scan: '/api/video/scan',
    playUrl: '/api/video/videos/:id/play-url'
  },
  
  // 播放记录
  playRecord: {
    save: '/api/video/play-records',
    get: '/api/video/play-records/:videoId',
    getAll: '/api/video/play-records',
    delete: '/api/video/play-records/:videoId'
  },
  
  // 文件夹配置
  folder: {
    getAll: '/api/folder/configs',
    add: '/api/folder/configs',
    update: '/api/folder/configs/:id',
    delete: '/api/folder/configs/:id',
    toggle: '/api/folder/configs/:id/toggle'
  },
  
  // 评论
  comment: {
    getByVideo: '/api/comment/video/:videoId',
    getByCollection: '/api/comment/collection/:collectionId',
    add: '/api/comment',
    delete: '/api/comment/:id',
    reply: '/api/comment/:id/reply'
  },
  
  // 用户
  user: {
    login: '/api/user/login',
    register: '/api/user/register',
    getCurrent: '/api/user/me',
    update: '/api/user/me',
    logout: '/api/user/logout'
  }
}

// 更新 video.ts
function updateVideoApi() {
  const filePath = path.join(__dirname, '../src/api/video.ts')
  let content = fs.readFileSync(filePath, 'utf-8')
  
  // 替换端点路径
  content = content.replace(
    /getCollections\(\): Promise<VideoCollection\[\]> \{[\s\S]*?return apiRequest\.get<VideoCollection\[\]>\(['"](.*?)['"]\)/,
    `getCollections(): Promise<VideoCollection[]> {
    return apiRequest.get<VideoCollection[]>('${API_ENDPOINTS.video.collections}')`
  )
  
  // 可以继续添加其他替换...
  
  fs.writeFileSync(filePath, content, 'utf-8')
  console.log('✅ Updated video.ts')
}

// 主函数
function main() {
  console.log('开始更新 API 端点...')
  console.log('请确保已根据 Swagger 文档更新 API_ENDPOINTS 对象')
  
  // updateVideoApi()
  // 可以添加其他更新函数...
  
  console.log('更新完成！')
}

if (require.main === module) {
  main()
}

module.exports = { API_ENDPOINTS }
