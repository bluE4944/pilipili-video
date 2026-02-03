<template>
  <div class="blog-detail" v-if="blog">
    <n-card>
      <n-space vertical :size="20">
        <n-space justify="space-between" align="center" :wrap="true">
          <n-space vertical :size="6">
            <n-text strong style="font-size: 24px">{{ blog.title }}</n-text>
            <n-space size="small" :wrap="true">
              <n-tag size="small" type="info">{{ formatDate(blog.createdAt) }}</n-tag>
              <n-text depth="3">阅读 {{ blog.views }}</n-text>
              <n-text depth="3">点赞 {{ blog.likes }}</n-text>
              <n-text depth="3">评论 {{ blog.comments.length }}</n-text>
            </n-space>
          </n-space>
          <n-space :wrap="true">
            <n-tooltip>
              <template #trigger>
                <n-button @click="toggleLike" type="primary" secondary circle>
                  <n-icon>
                    <HeartIcon v-if="blog.liked" />
                    <HeartOutlineIcon v-else />
                  </n-icon>
                </n-button>
              </template>
              <span>{{ blog.liked ? '取消点赞' : '点赞' }}</span>
            </n-tooltip>
            <n-button @click="goBack">返回目录</n-button>
          </n-space>
        </n-space>

        <div class="markdown-body" v-html="blog.contentHtml"></div>

        <n-divider />

        <n-card title="评论" size="small">
          <n-space vertical :size="12">
            <n-space vertical :size="8">
              <n-input v-model:value="commentName" placeholder="请输入用户名" />
              <n-input
                v-model:value="commentContent"
                type="textarea"
                placeholder="写下你的评论..."
                :rows="3"
                :maxlength="300"
                show-count
              />
              <n-space justify="end">
                <n-button type="primary" @click="submitComment">发表评论</n-button>
              </n-space>
            </n-space>

            <n-list v-if="blog.comments.length">
              <n-list-item v-for="comment in sortedComments" :key="comment.id">
                <n-thing>
                  <template #header>
                    <n-space align="center" :wrap="true">
                      <n-avatar round size="small">{{ comment.username[0] }}</n-avatar>
                      <n-text strong>{{ comment.username }}</n-text>
                      <n-text depth="3" style="font-size: 12px">
                        {{ formatDate(comment.createdAt) }}
                      </n-text>
                      <n-text depth="3" style="font-size: 12px">
                        点赞 {{ comment.likes }}
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
        </n-card>
      </n-space>
    </n-card>
  </div>
  <n-result v-else status="404" title="博客不存在" description="请返回目录查看其他博客">
    <template #footer>
      <n-button @click="goBack">返回目录</n-button>
    </template>
  </n-result>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import dayjs from 'dayjs'
import { useBlogStore } from '@/store/blog'
import { HeartOutline as HeartOutlineIcon, Heart as HeartIcon } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const blogStore = useBlogStore()

const blogId = computed(() => route.params.id as string)
const blog = computed(() => blogStore.getBlogById(blogId.value))

const commentName = ref('')
const commentContent = ref('')

const sortedComments = computed(() => {
  if (!blog.value) return []
  return [...blog.value.comments].sort((a, b) => b.createdAt - a.createdAt)
})

const formatDate = (timestamp: number) => dayjs(timestamp).format('YYYY-MM-DD HH:mm')

const goBack = () => {
  router.push({ name: 'blog' })
}

const toggleLike = () => {
  if (!blog.value) return
  blogStore.toggleLike(blog.value.id)
}

const submitComment = () => {
  if (!blog.value) return
  if (!commentName.value.trim()) {
    message.warning('请输入用户名')
    return
  }
  if (!commentContent.value.trim()) {
    message.warning('请输入评论内容')
    return
  }

  blogStore.addComment(blog.value.id, {
    username: commentName.value.trim(),
    content: commentContent.value.trim()
  })
  commentContent.value = ''
  message.success('评论已提交')
}

onMounted(() => {
  if (blog.value) {
    blogStore.incrementViews(blog.value.id)
  }
})

watch(blogId, () => {
  if (blog.value) {
    blogStore.incrementViews(blog.value.id)
  }
})
</script>

<style scoped lang="scss">
.blog-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.markdown-body {
  line-height: 1.8;
  font-size: 15px;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 16px 0 8px;
  }

  :deep(p) {
    margin: 8px 0;
  }

  :deep(blockquote) {
    margin: 12px 0;
    padding: 8px 12px;
    border-left: 4px solid #00a1d6;
    background: rgba(0, 161, 214, 0.08);
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 6px;
    margin: 8px 0;
  }

  :deep(pre.md-code) {
    background: #0f172a;
    color: #e2e8f0;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
  }

  :deep(.md-inline-code) {
    font-family: 'Fira Code', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 13px;
  }

  :deep(code.md-inline-code) {
    background: rgba(15, 23, 42, 0.08);
    padding: 2px 4px;
    border-radius: 4px;
  }
}

@media (max-width: 768px) {
  .blog-detail {
    max-width: 100%;
  }
}
</style>
