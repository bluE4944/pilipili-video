<template>
  <div class="video-home">
    <n-card>
      <n-space vertical :size="20">
        <n-space align="center" :wrap="true">
          <n-select v-model:value="searchType" :options="searchOptions" style="width: 120px" />
          <n-input
            v-model:value="searchQuery"
            placeholder="搜索视频..."
            clearable
            @update:value="handleSearch"
          >
            <template #prefix>
              <n-icon><SearchIcon /></n-icon>
            </template>
          </n-input>
        </n-space>

        <n-space justify="space-between" :wrap="true">
          <n-space>
            <n-button type="primary" @click="handleAddVideos">
              <template #icon>
                <n-icon><AddIcon /></n-icon>
              </template>
              添加视频
            </n-button>
            <n-button @click="handleScanVideos" :loading="videoStore.scanning">
              <template #icon>
                <n-icon><RefreshIcon /></n-icon>
              </template>
              扫描视频
            </n-button>
            <n-popover trigger="hover">
              <template #trigger>
                <n-button quaternary circle>
                  <template #icon>
                    <n-icon><InfoIcon /></n-icon>
                  </template>
                </n-button>
              </template>
              <span>如果浏览器无法访问本地文件，请使用后端扫描或上传功能。</span>
            </n-popover>
          </n-space>
          <n-space>
            <n-text depth="3">
              共 {{ searchQuery ? searchResults.length : filteredCollections.length }} 条结果
            </n-text>
          </n-space>
        </n-space>

        <n-spin :show="searchLoading">
          <template v-if="searchQuery">
            <n-grid v-if="searchResults.length" class="video-grid" :cols="5" :x-gap="16" :y-gap="16">
              <n-gi v-for="video in searchResults" :key="video.id">
                <n-card hoverable @click="goToVideoById(video.id)" class="video-card">
                  <template #cover>
                    <div class="video-cover">
                      <img v-if="video.coverUrl" :src="video.coverUrl" alt="cover" />
                      <n-icon v-else :size="48"><VideoLibraryIcon /></n-icon>
                    </div>
                  </template>
                  <n-ellipsis :tooltip="false" style="font-weight: 500">
                    {{ video.title || '未命名视频' }}
                  </n-ellipsis>
                  <div class="video-meta">
                    <n-text depth="3" style="font-size: 12px">
                      播放 {{ video.playCount || 0 }} · 点赞 {{ video.likeCount || 0 }}
                    </n-text>
                  </div>
                </n-card>
              </n-gi>
            </n-grid>
            <n-empty v-else description="暂无搜索结果" />
          </template>

          <template v-else>
            <n-grid v-if="filteredCollections.length" class="video-grid" :cols="5" :x-gap="16" :y-gap="16">
              <n-gi v-for="collection in filteredCollections" :key="collection.id">
                <n-card hoverable @click="goToVideoDetail(collection.id)" class="collection-card">
                  <template #cover>
                    <div class="collection-cover">
                      <n-icon :size="50">
                        <VideoLibraryIcon />
                      </n-icon>
                      <div class="episode-badge">{{ collection.totalEpisodes }} 集</div>
                    </div>
                  </template>
                  <n-ellipsis :tooltip="false" style="font-weight: 500">
                    {{ collection.title }}
                  </n-ellipsis>
                  <div class="collection-meta">
                    <n-text depth="3" style="font-size: 12px">
                      {{ collection.description }}
                    </n-text>
                  </div>
                </n-card>
              </n-gi>
            </n-grid>
            <n-empty v-else description="暂无视频，请先添加视频文件">
              <template #extra>
                <n-button type="primary" @click="handleAddVideos">
                  添加视频
                </n-button>
              </template>
            </n-empty>

            <n-card v-if="hotVideos.length" title="热门推荐" size="small" style="margin-top: 16px">
              <n-list>
                <n-list-item v-for="video in hotVideos" :key="video.id" @click="goToVideoById(video.id)">
                  <n-thing>
                    <template #header>
                      <n-space align="center">
                        <n-text strong>{{ video.title || '未命名视频' }}</n-text>
                        <n-tag size="small" type="info" v-if="video.categoryName">{{ video.categoryName }}</n-tag>
                      </n-space>
                    </template>
                    <template #description>
                      <n-text depth="3">播放 {{ video.playCount || 0 }}</n-text>
                    </template>
                  </n-thing>
                </n-list-item>
              </n-list>
            </n-card>
          </template>
        </n-spin>
      </n-space>
    </n-card>

    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="video/*"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useVideoStore } from '@/store/video'
import { videoSearchApi } from '@/api/video'
import { isVideoFile } from '@/utils/videoScanner'
import { registerVideoFile } from '@/utils/videoFileManager'
import type { BackendVideo } from '@/types'
import { getErrorMessage } from '@/utils/error'
import {
  SearchOutline as SearchIcon,
  AddOutline as AddIcon,
  RefreshOutline as RefreshIcon,
  VideoLibraryOutline as VideoLibraryIcon,
  InformationCircleOutline as InfoIcon
} from '@vicons/ionicons5'

const router = useRouter()
const videoStore = useVideoStore()
const message = useMessage()

const searchQuery = ref('')
const searchType = ref<'keyword' | 'tag' | 'category'>('keyword')
const searchResults = ref<BackendVideo[]>([])
const searchLoading = ref(false)
const hotVideos = ref<BackendVideo[]>([])
const fileInputRef = ref<HTMLInputElement>()
let searchTimer: number | null = null

const searchOptions = [
  { label: '关键词', value: 'keyword' },
  { label: '标签', value: 'tag' },
  { label: '分类ID', value: 'category' }
]

const filteredCollections = computed(() => {
  if (!searchQuery.value) {
    return videoStore.collections
  }

  const query = searchQuery.value.toLowerCase()
  return videoStore.collections.filter(collection =>
    collection.title.toLowerCase().includes(query) ||
    collection.description.toLowerCase().includes(query)
  )
})

const handleSearch = () => {
  if (searchTimer) {
    window.clearTimeout(searchTimer)
  }
  searchTimer = window.setTimeout(() => {
    performSearch()
  }, 300)
}

const performSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    searchResults.value = []
    searchLoading.value = false
    return
  }

  searchLoading.value = true
  try {
    if (searchType.value === 'keyword') {
      const page = await videoSearchApi.searchByKeyword(query, 1, 20)
      searchResults.value = page.records || []
    } else if (searchType.value === 'tag') {
      const page = await videoSearchApi.searchByTag(query, 1, 20)
      searchResults.value = page.records || []
    } else {
      const categoryId = Number(query)
      if (Number.isNaN(categoryId)) {
        message.warning('分类搜索请输入数字 ID')
        searchResults.value = []
      } else {
        const page = await videoSearchApi.searchByCategory(String(categoryId), 1, 20)
        searchResults.value = page.records || []
      }
    }
  } catch (error) {
    console.error('Failed to search videos:', error)
    message.error(getErrorMessage(error))
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const fetchHotVideos = async () => {
  try {
    hotVideos.value = await videoSearchApi.getHotVideos()
  } catch (error) {
    console.error('Failed to load hot videos:', error)
    hotVideos.value = []
  }
}

const handleAddVideos = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  try {
    message.loading('正在上传视频文件...', { duration: 0, key: 'loading' })

    let uploadedVideos: any[] = []

    if (files.length === 1) {
      const video = await videoStore.uploadVideo(files[0], (progress) => {
        message.loading(`上传中... ${progress}%`, { duration: 0, key: 'loading' })
      })
      uploadedVideos = [video]
    } else {
      uploadedVideos = await videoStore.uploadVideos(files, (progress) => {
        message.loading(`上传中... ${progress}%`, { duration: 0, key: 'loading' })
      })
    }

    uploadedVideos.forEach((video) => {
      const matchingFile = files.find(f => f.name === video.name && isVideoFile(f.name))
      if (matchingFile && matchingFile instanceof File && matchingFile.size > 0) {
        registerVideoFile(video.id, matchingFile)
      }
    })

    await videoStore.loadCollections()

    message.destroyAll()
    message.success(`成功上传 ${uploadedVideos.length} 个视频文件`)
  } catch (error) {
    console.error('Failed to upload videos:', error)
    message.destroyAll()
    message.error(getErrorMessage(error))
  } finally {
    if (target) target.value = ''
  }
}

const handleScanVideos = async () => {
  message.loading('正在请求后端扫描...', { duration: 0, key: 'scan' })
  try {
    await videoStore.scanAllVideos()
    message.destroyAll()
    message.success('扫描完成')
  } catch (error) {
    message.destroyAll()
    message.error(getErrorMessage(error))
  }
}

const goToVideoDetail = (id: string) => {
  router.push({ name: 'videoDetail', params: { id } })
}

const goToVideoById = (id?: number) => {
  if (!id) return
  router.push({ name: 'videoDetail', params: { id: String(id) } })
}

onMounted(() => {
  fetchHotVideos()
})
</script>

<style scoped lang="scss">
.video-home {
  max-width: 1400px;
  margin: 0 auto;
}

.collection-card,
.video-card {
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
}

.collection-cover {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;

  .episode-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.video-cover {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
  color: #fff;

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
}

.collection-meta,
.video-meta {
  margin-top: 8px;
}

@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 992px) {
  .video-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .collection-cover,
  .video-cover {
    height: 150px;
  }

  .video-cover img {
    height: 150px;
  }
}

@media (max-width: 520px) {
  .video-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }

  .collection-cover,
  .video-cover {
    height: 140px;
  }

  .video-cover img {
    height: 140px;
  }
}
</style>

