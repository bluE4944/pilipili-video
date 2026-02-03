import { apiRequest } from '@/utils/api'
import type { Comment, BackendComment, PageResult } from '@/types'

const toTimestamp = (value?: string) => {
  if (!value) return Date.now()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

const mapComment = (comment: BackendComment): Comment => {
  return {
    id: String(comment.id ?? ''),
    videoId: String(comment.videoId ?? ''),
    userId: String(comment.userId ?? ''),
    username: comment.userName || '',
    content: comment.content || '',
    createdAt: toTimestamp(comment.createTime),
    replies: []
  }
}

export const commentApi = {
  async getCommentsByVideoId(videoId: string, pageNum = 1, pageSize = 50, parentId?: number): Promise<Comment[]> {
    const page = await apiRequest.get<PageResult<BackendComment>>(`/api/video/interaction/comment/${videoId}`, {
      params: { pageNum, pageSize, parentId }
    })
    const records = page?.records || []
    return records.map(mapComment)
  },

  async getCommentsByCollectionId(_collectionId: string): Promise<Comment[]> {
    // Backend only supports video comments. Keep method for compatibility.
    return []
  },

  async addComment(comment: {
    videoId: string
    content: string
    parentId?: number
    userId?: string
    username?: string
    userAvatar?: string
  }): Promise<Comment> {
    const parsedUserId = comment.userId ? Number(comment.userId) : undefined
    const payload: BackendComment = {
      videoId: Number(comment.videoId),
      content: comment.content,
      parentId: comment.parentId ?? 0,
      userId: Number.isNaN(parsedUserId as number) ? undefined : parsedUserId,
      userName: comment.username,
      userAvatar: comment.userAvatar
    }

    const result = await apiRequest.post<BackendComment>('/api/video/interaction/comment', payload)
    return mapComment(result)
  },

  deleteComment(id: string): Promise<void> {
    return apiRequest.delete<void>(`/api/video/interaction/comment/${id}`)
  },

  replyComment(commentId: string, reply: { videoId: string; content: string; userId?: string; username?: string }): Promise<Comment> {
    return this.addComment({
      videoId: reply.videoId,
      content: reply.content,
      parentId: Number(commentId),
      userId: reply.userId,
      username: reply.username
    })
  }
}
