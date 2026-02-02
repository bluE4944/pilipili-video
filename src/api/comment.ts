import { apiRequest } from '@/utils/api'
import type { Comment } from '@/types'

// 评论相关 API
export const commentApi = {
  // 获取视频的评论
  getCommentsByVideoId(videoId: string): Promise<Comment[]> {
    return apiRequest.get<Comment[]>(`/api/comment/video/${videoId}`)
  },

  // 获取合集的评论
  getCommentsByCollectionId(collectionId: string): Promise<Comment[]> {
    return apiRequest.get<Comment[]>(`/api/comment/collection/${collectionId}`)
  },

  // 添加评论
  addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    return apiRequest.post<Comment>('/api/comment', comment)
  },

  // 删除评论
  deleteComment(id: string): Promise<void> {
    return apiRequest.delete<void>(`/api/comment/${id}`)
  },

  // 回复评论
  replyComment(commentId: string, reply: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    return apiRequest.post<Comment>(`/api/comment/${commentId}/reply`, reply)
  }
}
