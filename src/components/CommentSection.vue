<template>
  <div class="comment-section">
    <n-space vertical :size="16">
      <n-input
        v-model:value="commentContent"
        type="textarea"
        placeholder="写下你的评论..."
        :rows="3"
        :maxlength="500"
        show-count
      />
      <n-space justify="end">
        <n-button @click="handleSubmitComment" type="primary" :disabled="!commentContent.trim()">
          发表评论
        </n-button>
      </n-space>

      <n-list v-if="comments.length > 0">
        <n-list-item v-for="comment in comments" :key="comment.id">
          <n-thing>
            <template #header>
              <n-space align="center">
                <n-avatar round size="small">{{ comment.username[0] }}</n-avatar>
                <n-text strong>{{ comment.username }}</n-text>
                <n-text depth="3" style="font-size: 12px">
                  {{ formatTime(comment.createdAt) }}
                </n-text>
              </n-space>
            </template>
            <template #description>
              <n-text>{{ comment.content }}</n-text>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>

      <n-empty v-else description="暂无评论，快来发表第一条评论吧" />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { commentApi } from '@/api/comment'
import type { Comment } from '@/types'
import { useMessage } from 'naive-ui'
import dayjs from 'dayjs'
import { isNumericId } from '@/utils/id'

interface Props {
  videoId: string
  collectionId?: string
}

const props = defineProps<Props>()

const userStore = useUserStore()
const message = useMessage()

const comments = ref<Comment[]>([])
const commentContent = ref('')

const loadComments = async () => {
  if (!props.videoId) {
    comments.value = []
    return
  }
  if (!isNumericId(props.videoId)) {
    try {
      const { getCommentsByVideoId, getCommentsByCollectionId } = await import('@/utils/storage')
      if (props.collectionId) {
        const collectionComments = await getCommentsByCollectionId(props.collectionId)
        comments.value = collectionComments.map(c => ({
          ...c,
          replies: []
        }))
      } else {
        const videoComments = await getCommentsByVideoId(props.videoId)
        comments.value = videoComments.map(c => ({
          ...c,
          replies: []
        }))
      }
      comments.value.sort((a, b) => b.createdAt - a.createdAt)
    } catch (e) {
      console.error('Failed to load comments from local storage:', e)
    }
    return
  }
  try {
    comments.value = await commentApi.getCommentsByVideoId(props.videoId)
    comments.value.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('Failed to load comments:', error)
    try {
      const { getCommentsByVideoId, getCommentsByCollectionId } = await import('@/utils/storage')
      if (props.collectionId) {
        const collectionComments = await getCommentsByCollectionId(props.collectionId)
        comments.value = collectionComments.map(c => ({
          ...c,
          replies: []
        }))
      } else {
        const videoComments = await getCommentsByVideoId(props.videoId)
        comments.value = videoComments.map(c => ({
          ...c,
          replies: []
        }))
      }
      comments.value.sort((a, b) => b.createdAt - a.createdAt)
    } catch (e) {
      console.error('Failed to load comments from local storage:', e)
    }
  }
}

const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) return

  if (!userStore.currentUser) {
    message.warning('请先登录')
    return
  }

  if (!isNumericId(props.videoId)) {
    try {
      const { saveComment } = await import('@/utils/storage')
      const localComment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        videoId: props.videoId,
        collectionId: props.collectionId,
        userId: userStore.currentUser.id,
        username: userStore.currentUser.username,
        content: commentContent.value.trim(),
        createdAt: Date.now()
      }
      await saveComment(localComment)
      comments.value.unshift(localComment)
      commentContent.value = ''
      message.success('评论发表成功（本地模式）')
    } catch (e) {
      message.error('发表评论失败：' + (e as Error).message)
    }
    return
  }

  try {
    const newComment = await commentApi.addComment({
      videoId: props.videoId,
      userId: userStore.currentUser.id,
      username: userStore.currentUser.username,
      content: commentContent.value.trim()
    })

    comments.value.unshift(newComment)
    commentContent.value = ''
    message.success('评论发表成功')
  } catch (error) {
    console.error('Failed to submit comment:', error)
    try {
      const { saveComment } = await import('@/utils/storage')
      const localComment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        videoId: props.videoId,
        collectionId: props.collectionId,
        userId: userStore.currentUser.id,
        username: userStore.currentUser.username,
        content: commentContent.value.trim(),
        createdAt: Date.now()
      }
      await saveComment(localComment)
      comments.value.unshift(localComment)
      commentContent.value = ''
      message.success('评论发表成功（本地模式）')
    } catch (e) {
      message.error('发表评论失败：' + (error as Error).message)
    }
  }
}

const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)} 天前`
  }
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  loadComments()
})

watch([() => props.videoId, () => props.collectionId], () => {
  loadComments()
})
</script>

<style scoped lang="scss">
.comment-section {
  padding: 16px 0;
}
</style>
