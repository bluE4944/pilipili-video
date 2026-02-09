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
        @keydown="handleCommentKeydown"
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
import { getErrorMessage } from '@/utils/error'

interface Props {
  videoId: string
  collectionId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submitted: []
}>()

const userStore = useUserStore()
const message = useMessage()

const comments = ref<Comment[]>([])
const commentContent = ref('')

const loadComments = async () => {
  if (!props.videoId) {
    comments.value = []
    return
  }
  try {
    comments.value = await commentApi.getCommentsByVideoId(props.videoId)
    comments.value.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('Failed to load comments:', error)
    message.error(getErrorMessage(error))
    comments.value = []
  }
}

const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) return

  if (!userStore.currentUser) {
    message.warning('请先登录')
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
    emit('submitted')
    message.success('评论发表成功')
  } catch (error) {
    console.error('Failed to submit comment:', error)
    message.error(getErrorMessage(error))
  }
}

const handleCommentKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return
  if (event.altKey) return
  event.preventDefault()
  handleSubmitComment()
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
