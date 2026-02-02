# API 端点映射指南

本文档帮助您根据 Swagger 文档调整 API 端点路径。

## 如何查看 Swagger 文档

1. 启动后端服务
2. 访问 `http://localhost:8316/swagger-ui.html`
3. 查看各个 API 端点的路径和参数

## 当前 API 端点定义

### 视频相关 API (`src/api/video.ts`)

当前定义的端点：
- `GET /api/video/collections` - 获取所有视频合集
- `GET /api/video/collections/:id` - 获取合集详情
- `GET /api/video/videos` - 获取所有视频
- `GET /api/video/videos/:id` - 获取视频详情
- `POST /api/video/upload` - 上传单个视频文件
- `POST /api/video/upload/batch` - 批量上传视频文件
- `POST /api/video/scan` - 扫描文件夹中的视频
- `GET /api/video/videos/:id/play-url` - 获取视频播放URL

**需要根据 Swagger 文档调整的内容：**
1. 检查实际的端点路径（可能不是 `/api/video/...`）
2. 检查请求方法（GET/POST/PUT/DELETE）
3. 检查请求参数格式
4. 检查响应数据格式

### 播放记录 API (`src/api/video.ts`)

当前定义的端点：
- `POST /api/video/play-records` - 保存播放记录
- `GET /api/video/play-records/:videoId` - 获取播放记录
- `GET /api/video/play-records` - 获取所有播放记录
- `DELETE /api/video/play-records/:videoId` - 删除播放记录

### 文件夹配置 API (`src/api/folder.ts`)

当前定义的端点：
- `GET /api/folder/configs` - 获取所有文件夹配置
- `POST /api/folder/configs` - 添加文件夹配置
- `PUT /api/folder/configs/:id` - 更新文件夹配置
- `DELETE /api/folder/configs/:id` - 删除文件夹配置
- `PUT /api/folder/configs/:id/toggle` - 启用/禁用文件夹

### 评论 API (`src/api/comment.ts`)

当前定义的端点：
- `GET /api/comment/video/:videoId` - 获取视频的评论
- `GET /api/comment/collection/:collectionId` - 获取合集的评论
- `POST /api/comment` - 添加评论
- `DELETE /api/comment/:id` - 删除评论
- `POST /api/comment/:id/reply` - 回复评论

### 用户 API (`src/api/user.ts`)

当前定义的端点：
- `POST /api/user/login` - 登录
- `POST /api/user/register` - 注册
- `GET /api/user/me` - 获取当前用户信息
- `PUT /api/user/me` - 更新用户信息
- `POST /api/user/logout` - 登出

## 调整步骤

### 步骤 1: 查看 Swagger 文档

在 Swagger UI 中，找到对应的 API 端点，记录：
- 路径（Path）
- 方法（GET/POST/PUT/DELETE）
- 请求参数（Parameters）
- 请求体（Request Body）
- 响应格式（Response）

### 步骤 2: 修改 API 文件

例如，如果实际的视频合集 API 是 `GET /collections` 而不是 `GET /api/video/collections`：

**修改 `src/api/video.ts`：**

```typescript
// 修改前
getCollections(): Promise<VideoCollection[]> {
  return apiRequest.get<VideoCollection[]>('/api/video/collections')
}

// 修改后
getCollections(): Promise<VideoCollection[]> {
  return apiRequest.get<VideoCollection[]>('/collections')
}
```

### 步骤 3: 检查请求参数

如果 API 需要查询参数，例如：

```typescript
// Swagger 显示: GET /collections?page=1&size=10
getCollections(page: number = 1, size: number = 10): Promise<VideoCollection[]> {
  return apiRequest.get<VideoCollection[]>('/collections', {
    params: { page, size }
  })
}
```

### 步骤 4: 检查请求体格式

如果上传文件需要不同的字段名：

```typescript
// Swagger 显示: POST /upload，字段名为 videoFile
uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<VideoFile> {
  const formData = new FormData()
  formData.append('videoFile', file)  // 根据 Swagger 调整字段名
  
  return apiRequest.upload<VideoFile>('/upload', formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })
}
```

### 步骤 5: 检查响应格式

如果后端返回的数据结构不同，可能需要调整 `src/utils/api.ts` 中的响应拦截器：

```typescript
// 如果后端返回格式为 { success: true, result: {...} }
// 而不是 { code: 200, data: {...} }
// 需要修改响应拦截器
```

## 常见调整场景

### 场景 1: API 路径前缀不同

如果所有 API 都有统一的前缀，例如 `/api/v1`：

```typescript
// 在 src/utils/api.ts 中修改 baseURL
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL + '/api/v1',  // 添加前缀
  // ...
})
```

### 场景 2: 认证方式不同

如果使用不同的认证方式，例如 API Key：

```typescript
// 在 src/utils/api.ts 的请求拦截器中修改
apiClient.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('apiKey')
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey  // 或其他认证方式
    }
    return config
  },
  // ...
)
```

### 场景 3: 响应格式不同

如果后端返回格式为 `{ success: true, data: {...} }`：

```typescript
// 在 src/utils/api.ts 的响应拦截器中修改
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data && typeof response.data === 'object') {
      // 检查 success 字段
      if (response.data.success === false) {
        return Promise.reject(new Error(response.data.message || '请求失败'))
      }
      // 返回 data 字段
      return response.data.data !== undefined ? response.data.data : response.data
    }
    return response
  },
  // ...
)
```

## 测试调整后的 API

1. 启动前端项目：`npm run serve`
2. 测试各个功能模块
3. 查看浏览器控制台的网络请求
4. 检查请求和响应是否符合预期

## 需要帮助？

如果遇到问题，请提供：
1. Swagger 文档中相关 API 的截图或描述
2. 实际的 API 端点路径
3. 请求/响应的示例数据
