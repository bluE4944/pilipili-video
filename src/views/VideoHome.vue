<template>
  <div class="video-home">
    <div class="hero-banner">
      <n-carousel
        class="hero-carousel"
        autoplay
        :interval="5000"
        :show-dots="hotVideos.length > 1"
        dot-type="line"
        show-arrow
      >
        <n-carousel-item v-for="item in hotVideos" :key="item.id">
          <div class="hero-slide" :style="{ backgroundImage: `url(${resolveVideoCover(item)})` }">
            <div class="hero-mask"></div>
            <div class="hero-content">
              <div class="hero-text">
                <h2>{{ item.title || '推荐视频' }}</h2>
                <p>{{ item.description || '发现更多精彩内容' }}</p>
              </div>
            </div>
          </div>
        </n-carousel-item>
      </n-carousel>
      <div
        class="hero-search"
        :style="searchStyle"
        @mousedown="onSearchMouseDown"
        ref="searchRef"
      >
        <n-space align="center" :wrap="true">
          <n-select v-model:value="searchType" :options="searchOptions" style="width: 120px" />
          <n-input
            v-model:value="searchQuery"
            placeholder="搜索视频..."
            clearable
            @update:value="handleSearch"
          >
            <template #prefix>
              <n-icon v-if="searchIcon">
                <component :is="searchIcon" />
              </n-icon>
            </template>
          </n-input>
        </n-space>
      </div>
    </div>

    <n-card class="hot-card" v-if="recentWatching.length">
      <div class="hot-header">
        <n-text strong>最近在看</n-text>
      </div>
      <div class="hot-scroll" :style="hotScrollStyle">
        <div
          v-for="item in visibleRecentWatching"
          :key="item.id"
          class="hot-item"
          @click="goToVideoDetail(item.id)"
        >
          <div class="hot-cover">
            <img :src="item.cover" alt="cover" />
            <div class="hot-title">{{ item.title || '未命名视频' }}</div>
            <div class="hot-plays">{{ item.totalEpisodes }} 集</div>
            <div class="play-badge" v-if="item.playCount !== undefined">
              播放 {{ item.playCount || 0 }}
            </div>
          </div>
        </div>
      </div>
    </n-card>

    <n-card>
      <n-space vertical :size="20">
        <n-space justify="space-between" :wrap="true">
          <n-space>
            <n-text depth="3">
              共 {{ searchQuery ? searchResults.length : filteredCollections.length }} 条结果
            </n-text>
          </n-space>
          <n-space>
            <n-text depth="3" v-if="isLoadingMore">
              正在加载更多...
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
                      <img :src="resolveVideoCover(video)" alt="cover" />
                      <div class="play-badge">
                        播放 {{ video.playCount || 0 }}
                      </div>
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
                      <img
                        class="collection-cover-img"
                        :src="resolveApiUrl(collection.cover) || getFallbackCover(collection.id ?? '')"
                        alt="cover"
                      />
                      <div class="episode-badge" v-if="collection.totalEpisodes > 1">
                        {{ collection.totalEpisodes }} 集
                      </div>
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
            <n-empty v-else description="暂无视频，请先在设置中添加视频或扫描" />

          </template>
        </n-spin>
      </n-space>
    </n-card>

    <n-back-top :right="24" :bottom="32" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useVideoStore } from '@/store/video'
import { videoSearchApi, videoApi } from '@/api/video'
import type { BackendVideo } from '@/types'
import { getErrorMessage } from '@/utils/error'
import { resolveApiUrl } from '@/utils/api'
import { getFallbackCover } from '@/utils/fallbackCover'
import {
  SearchOutline as SearchIcon,
  VideoLibraryOutline as VideoLibraryIcon
} from '@vicons/ionicons5'

const router = useRouter()
const videoStore = useVideoStore()
const message = useMessage()
const videoLibraryIcon = VideoLibraryIcon || null
const searchIcon = SearchIcon || null

const resolveVideoCover = (video: BackendVideo) => {
  return resolveApiUrl(video.coverUrl) || getFallbackCover(video.id ?? '')
}

const hotColumns = computed(() => {
  if (windowWidth.value >= 1200) return 6
  if (windowWidth.value >= 992) return 5
  return 4
})

const recentWatching = computed(() => {
  return (videoStore.recentPlayList || [])
    .filter(item => item.video && item.video.id)
    .slice(0, 6)
    .map(item => ({
      id: String(item.video!.id ?? ''),
      title: item.video!.title || '未命名视频',
      cover: resolveApiUrl(item.video!.coverUrl) || getFallbackCover(item.video!.id ?? ''),
      totalEpisodes: 1,
      playCount: item.video!.playCount ?? 0
    }))
})

const visibleRecentWatching = computed(() => {
  return hotColumns.value > 4 ? recentWatching.value.slice(0, hotColumns.value) : recentWatching.value
})

const hotScrollStyle = computed(() => ({
  '--hot-columns': String(hotColumns.value)
}))

const searchQuery = ref('')
const searchType = ref<'keyword' | 'tag' | 'category'>('keyword')
const searchResults = ref<BackendVideo[]>([])
const searchLoading = ref(false)
const hotVideos = ref<BackendVideo[]>([])
const windowWidth = ref(window.innerWidth)
let searchTimer: number | null = null
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const isLoadingMore = ref(false)
const searchPos = ref({ x: 0, y: 0 })
const isDraggingSearch = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const searchRef = ref<HTMLDivElement | null>(null)
const searchStyle = computed(() => ({
  position: 'fixed',
  left: `${searchPos.value.x}px`,
  top: `${searchPos.value.y}px`
}))


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

const loadCollectionsPage = async (reset = false) => {
  if (isLoadingMore.value) return
  if (reset) {
    pageNum.value = 1
    total.value = 0
    videoStore.collections = []
  }
  isLoadingMore.value = true
  try {
    const page = await videoApi.getCollectionsPage(pageNum.value, pageSize.value)
    total.value = page.total || 0
    const records = page.records || []
    if (pageNum.value === 1) {
      videoStore.collections = records
    } else if (records.length > 0) {
      videoStore.collections.push(...records)
    }
    if (records.length > 0) {
      pageNum.value += 1
    }
  } catch (error) {
    console.error('Failed to load collections:', error)
    message.error(getErrorMessage(error))
  } finally {
    isLoadingMore.value = false
  }
}

const initSearchPos = () => {
  if (searchPos.value.x !== 0 || searchPos.value.y !== 0) return
  const width = searchRef.value?.offsetWidth || 360
  searchPos.value = {
    x: Math.max(16, Math.round((window.innerWidth - width) / 2)),
    y: 96
  }
}

const onSearchMouseDown = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest('.n-select, .n-input, input')) return
  event.preventDefault()
  isDraggingSearch.value = true
  dragOffset.value = {
    x: event.clientX - searchPos.value.x,
    y: event.clientY - searchPos.value.y
  }
  window.addEventListener('mousemove', onSearchMouseMove)
  window.addEventListener('mouseup', onSearchMouseUp)
}

const onSearchMouseMove = (event: MouseEvent) => {
  if (!isDraggingSearch.value) return
  searchPos.value = {
    x: Math.max(16, Math.min(window.innerWidth - 200, event.clientX - dragOffset.value.x)),
    y: Math.max(16, Math.min(window.innerHeight - 80, event.clientY - dragOffset.value.y))
  }
}

const onSearchMouseUp = () => {
  isDraggingSearch.value = false
  window.removeEventListener('mousemove', onSearchMouseMove)
  window.removeEventListener('mouseup', onSearchMouseUp)
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

const handleScroll = () => {
  if (searchQuery.value) return
  if (isLoadingMore.value) return
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  const fullHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  if (scrollTop + viewportHeight + 200 >= fullHeight) {
    const loaded = videoStore.collections.length
    if (total.value === 0 || loaded < total.value) {
      loadCollectionsPage()
    }
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
  loadCollectionsPage(true)
  videoStore.loadRecentPlayList(6)
  initSearchPos()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', initSearchPos, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', initSearchPos)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', onSearchMouseMove)
  window.removeEventListener('mouseup', onSearchMouseUp)
})
</script>

<style scoped lang="scss">
.video-home {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-banner {
  position: relative;
  height: 320px;
  border-radius: 12px;
  overflow: visible;
  margin-bottom: 32px;
}

.hero-carousel {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.hero-slide {
  position: relative;
  height: 320px;
  background: linear-gradient(135deg, #1f7cc0 0%, #00b5e5 100%);
  background-size: cover;
  background-position: center;
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 24px;
  color: #fff;
  z-index: 1;
}

.hero-text h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.hero-text p {
  max-width: 520px;
  opacity: 0.85;
}

.hero-search {
  z-index: 10;
  background: var(--n-card-color);
  padding: 12px 16px;
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  border: 1px solid var(--n-border-color);
  cursor: move;
  user-select: none;
}

.hero-search :deep(.n-input) {
  min-width: 280px;
}

.hero-search :deep(.n-input__input) {
  color: var(--n-text-color);
}

.hero-search :deep(.n-input__placeholder) {
  color: var(--n-text-color-3);
}

.hero-search :deep(.n-base-selection) {
  background-color: transparent;
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

.collection-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-cover {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
  color: #fff;
  position: relative;

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
  .hero-banner {
    height: 240px;
  }

  .hero-slide {
    height: 240px;
  }

  .hero-search {
    width: calc(100% - 24px);
    border-radius: 12px;
  }

  .hero-search :deep(.n-input) {
    min-width: 160px;
  }

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
  .hero-text h2 {
    font-size: 20px;
  }

  .hero-text p {
    font-size: 12px;
  }

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

.hot-card {
  margin-bottom: 16px;
}

.hot-header {
  margin-bottom: 12px;
}

.hot-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  scroll-snap-type: x mandatory;
  --hot-columns: 6;
}

.hot-item {
  flex: 0 0 auto;
  width: calc((100% - (var(--hot-columns) - 1) * 12px) / var(--hot-columns));
  cursor: pointer;
  scroll-snap-align: start;
}

.hot-cover {
  position: relative;
  height: 124px;
  border-radius: 10px;
  overflow: hidden;
  background: #111;
}

.hot-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-title {
  position: absolute;
  left: 8px;
  top: 8px;
  color: #fff;
  font-size: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  max-width: calc(100% - 16px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 6px;
  border-radius: 8px;
}

.hot-plays {
  position: absolute;
  right: 8px;
  bottom: 8px;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 6px;
  border-radius: 8px;
}

.play-badge {
  position: absolute;
  left: 8px;
  bottom: 8px;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 6px;
  border-radius: 8px;
}
</style>
