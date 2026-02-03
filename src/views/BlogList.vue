<template>
  <div class="blog-list">
    <n-card>
      <n-space vertical :size="20">
        <n-space justify="space-between" align="center" :wrap="true">
          <n-space align="center" :wrap="true">
            <n-input
              v-model:value="query"
              placeholder="搜索博客标题或内容..."
              clearable
              style="min-width: 240px"
            >
              <template #prefix>
                <n-icon><SearchIcon /></n-icon>
              </template>
            </n-input>
            <n-button type="primary" @click="triggerUpload">
              <template #icon>
                <n-icon><UploadIcon /></n-icon>
              </template>
              上传 MD
            </n-button>
          </n-space>
          <n-text depth="3">共 {{ filteredBlogs.length }} 篇</n-text>
        </n-space>

        <n-list v-if="filteredBlogs.length">
          <n-list-item v-for="blog in filteredBlogs" :key="blog.id" class="blog-item">
            <n-thing>
              <template #header>
                <n-space align="center" justify="space-between" :wrap="true">
                  <n-text strong class="blog-title" @click="goDetail(blog.id)">
                    {{ blog.title }}
                  </n-text>
                  <n-tooltip>
                    <template #trigger>
                      <n-button
                        quaternary
                        size="small"
                        circle
                        :type="blog.liked ? 'error' : 'default'"
                        @click="toggleLike(blog.id)"
                      >
                        <n-icon>
                          <HeartIcon v-if="blog.liked" />
                          <HeartOutlineIcon v-else />
                        </n-icon>
                      </n-button>
                    </template>
                    <span>{{ blog.liked ? '取消点赞' : '点赞' }}</span>
                  </n-tooltip>
                </n-space>
              </template>
              <template #description>
                <n-text depth="3">{{ blog.summary }}</n-text>
                <n-space size="small" style="margin-top: 8px" :wrap="true">
                  <n-tag size="small" type="info">{{ formatDate(blog.createdAt) }}</n-tag>
                  <n-text depth="3">阅读 {{ blog.views }}</n-text>
                  <n-text depth="3">点赞 {{ blog.likes }}</n-text>
                  <n-text depth="3">评论 {{ blog.comments.length }}</n-text>
                </n-space>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
        <n-empty v-else description="未找到相关博客" />
      </n-space>
    </n-card>

    <input
      ref="fileInputRef"
      type="file"
      accept=".md"
      style="display: none"
      @change="handleUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useBlogStore } from '@/store/blog'
import dayjs from 'dayjs'
import {
  SearchOutline as SearchIcon,
  CloudUploadOutline as UploadIcon,
  HeartOutline as HeartOutlineIcon,
  Heart as HeartIcon
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const blogStore = useBlogStore()

const query = ref('')
const fileInputRef = ref<HTMLInputElement>()

const filteredBlogs = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) {
    return [...blogStore.blogs].sort((a, b) => b.createdAt - a.createdAt)
  }
  return blogStore.blogs
    .filter(blog => {
      const target = `${blog.title} ${blog.contentMarkdown}`.toLowerCase()
      return target.includes(keyword)
    })
    .sort((a, b) => b.createdAt - a.createdAt)
})

const formatDate = (timestamp: number) => dayjs(timestamp).format('YYYY-MM-DD HH:mm')

const goDetail = (id: string) => {
  router.push({ name: 'blogDetail', params: { id } })
}

const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.md')) {
    message.warning('请选择 .md 文件')
    return
  }

  try {
    const content = await file.text()
    blogStore.addBlogFromMarkdown(content, file.name)
    message.success('博客上传成功')
  } catch (error) {
    console.error('Failed to read markdown file:', error)
    message.error('读取文件失败')
  } finally {
    if (target) target.value = ''
  }
}

const toggleLike = (id: string) => {
  blogStore.toggleLike(id)
}
</script>

<style scoped lang="scss">
.blog-list {
  max-width: 1200px;
  margin: 0 auto;
}

.blog-item {
  cursor: default;
}

.blog-title {
  cursor: pointer;
}

.blog-title:hover {
  color: #00a1d6;
}

@media (max-width: 768px) {
  .blog-list {
    max-width: 100%;
  }
}
</style>
