# API 集成说明

## 概述

项目已调整为调用后端 API 的形式。所有 API 调用都通过 `src/api/` 目录下的模块进行。

## 环境配置

创建 `.env` 文件（参考 `.env.example`）：

```env
VITE_API_BASE_URL=http://localhost:8316
```

## API 端点说明

### 视频相关 API (`src/api/video.ts`)

- `GET /api/video/collections` - 获取所有视频合集
- `GET /api/video/collections/:id` - 获取合集详情
- `GET /api/video/videos` - 获取所有视频
- `GET /api/video/videos/:id` - 获取视频详情
- `POST /api/video/upload` - 上传单个视频文件
- `POST /api/video/upload/batch` - 批量上传视频文件
- `POST /api/video/scan` - 扫描文件夹中的视频
- `GET /api/video/videos/:id/play-url` - 获取视频播放URL

### 播放记录 API (`src/api/video.ts`)

- `POST /api/video/play-records` - 保存播放记录
- `GET /api/video/play-records/:videoId` - 获取播放记录
- `GET /api/video/play-records` - 获取所有播放记录
- `DELETE /api/video/play-records/:videoId` - 删除播放记录

### 文件夹配置 API (`src/api/folder.ts`)

- `GET /api/folder/configs` - 获取所有文件夹配置
- `POST /api/folder/configs` - 添加文件夹配置
- `PUT /api/folder/configs/:id` - 更新文件夹配置
- `DELETE /api/folder/configs/:id` - 删除文件夹配置
- `PUT /api/folder/configs/:id/toggle` - 启用/禁用文件夹

### 评论 API (`src/api/comment.ts`)

- `GET /api/comment/video/:videoId` - 获取视频的评论
- `GET /api/comment/collection/:collectionId` - 获取合集的评论
- `POST /api/comment` - 添加评论
- `DELETE /api/comment/:id` - 删除评论
- `POST /api/comment/:id/reply` - 回复评论

### 用户 API (`src/api/user.ts`)

- `POST /api/user/login` - 登录
- `POST /api/user/register` - 注册
- `GET /api/user/me` - 获取当前用户信息
- `PUT /api/user/me` - 更新用户信息
- `POST /api/user/logout` - 登出

## 降级策略

所有 API 调用都实现了降级策略：
- 如果后端 API 调用失败，会自动降级到本地存储（IndexedDB/localStorage）
- 确保在网络问题或后端不可用时，应用仍能基本运行

## 认证

API 请求会自动在请求头中添加 `Authorization: Bearer {token}`，token 从 `localStorage.getItem('token')` 获取。

## 响应格式

后端 API 应返回以下格式之一：

1. 标准格式：
```json
{
  "code": 200,
  "data": {...},
  "message": "success"
}
```

2. 直接数据格式：
```json
{...}
```

API 拦截器会自动处理这两种格式。

## 注意事项

1. **API 端点可能需要根据实际 Swagger 文档调整**
   - 请根据 `http://localhost:8316/swagger-ui.html` 中的实际 API 定义调整 `src/api/` 目录下的端点路径

2. **文件上传**
   - 视频文件上传使用 `FormData` 格式
   - 支持上传进度回调

3. **视频播放**
   - 优先使用本地文件（如果存在）
   - 如果本地文件不存在，从后端获取播放 URL

4. **错误处理**
   - 所有 API 调用都有错误处理和降级策略
   - 错误信息会通过 Naive UI 的 message 组件显示

## 修改 API 端点

如果后端 API 端点与当前实现不同，请修改 `src/api/` 目录下对应的文件。

例如，如果实际的视频合集 API 是 `GET /api/collections` 而不是 `GET /api/video/collections`，请修改 `src/api/video.ts`：

```typescript
getCollections(): Promise<VideoCollection[]> {
  return apiRequest.get<VideoCollection[]>('/api/collections')  // 修改这里
}
```
