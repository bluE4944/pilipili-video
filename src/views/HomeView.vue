<template>
  <div class="home-view">
    <n-card>
      <n-space vertical :size="20">
        <div class="welcome-section">
          <h1>欢迎使用 PiliPili Video</h1>
          <p>您的局域网视频播放平台</p>
        </div>

        <template v-for="section in orderedSections" :key="section">
          <div class="home-section" v-if="section === 'stats'">
            <n-grid class="home-stats-grid" :cols="3" :x-gap="20" :y-gap="20">
              <n-gi>
                <n-statistic label="视频合集" :value="videoStore.collections.length">
                  <template #suffix>
                    <n-icon v-if="videoLibraryIcon">
                      <component :is="videoLibraryIcon" />
                    </n-icon>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="视频总数" :value="totalVideos">
                  <template #suffix>
                    <n-icon v-if="playIcon">
                      <component :is="playIcon" />
                    </n-icon>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="播放记录" :value="playRecordCount">
                  <template #suffix>
                    <n-icon v-if="timeIcon">
                      <component :is="timeIcon" />
                    </n-icon>
                  </template>
                </n-statistic>
              </n-gi>
            </n-grid>
          </div>

          <div class="home-section" v-else-if="section === 'quick'">
            <div class="quick-actions">
              <h3>快速操作</h3>
              <n-space>
                <n-button type="primary" @click="goToVideo">
                  <template #icon>
                    <n-icon v-if="playIcon">
                      <component :is="playIcon" />
                    </n-icon>
                  </template>
                  浏览视频
                </n-button>
                <n-button @click="goToSettings">
                  <template #icon>
                    <n-icon v-if="settingsIcon">
                      <component :is="settingsIcon" />
                    </n-icon>
                  </template>
                  配置文件夹
                </n-button>
                <template v-if="!isMobile">
                  <n-popover trigger="click" placement="bottom-start">
                    <template #trigger>
                      <n-button quaternary size="small">
                        <template #icon>
                          <n-icon><SwapVerticalIcon /></n-icon>
                        </template>
                        排序
                      </n-button>
                    </template>
                    <n-space vertical :size="6" class="quick-order-list">
                      <div v-for="section in sectionOrder" :key="section" class="section-order-row">
                        <span class="section-order-label">{{ sectionLabelMap[section] }}</span>
                        <n-space :size="4">
                          <n-button quaternary size="tiny" @click="moveSection(section, -1)">
                            <template #icon>
                              <n-icon><ChevronUpIcon /></n-icon>
                            </template>
                          </n-button>
                          <n-button quaternary size="tiny" @click="moveSection(section, 1)">
                            <template #icon>
                              <n-icon><ChevronDownIcon /></n-icon>
                            </template>
                          </n-button>
                        </n-space>
                      </div>
                    </n-space>
                  </n-popover>
                </template>
                <template v-else>
                  <n-button quaternary size="small" @click="showOrderDrawer = true">
                    <template #icon>
                      <n-icon><SwapVerticalIcon /></n-icon>
                    </template>
                    排序
                  </n-button>
                  <n-drawer v-model:show="showOrderDrawer" placement="bottom" height="320">
                    <n-drawer-content title="卡片排序">
                      <n-space vertical :size="8" class="quick-order-list">
                        <div v-for="section in sectionOrder" :key="section" class="section-order-row">
                          <span class="section-order-label">{{ sectionLabelMap[section] }}</span>
                          <n-space :size="4">
                            <n-button quaternary size="tiny" @click="moveSection(section, -1)">
                              <template #icon>
                                <n-icon><ChevronUpIcon /></n-icon>
                              </template>
                            </n-button>
                            <n-button quaternary size="tiny" @click="moveSection(section, 1)">
                              <template #icon>
                                <n-icon><ChevronDownIcon /></n-icon>
                              </template>
                            </n-button>
                          </n-space>
                        </div>
                      </n-space>
                    </n-drawer-content>
                  </n-drawer>
                </template>
              </n-space>
            </div>
          </div>

          <div class="home-section" v-else-if="section === 'panels'">
            <n-grid class="home-panels-grid" :cols="2" :x-gap="20" :y-gap="20">
              <n-gi>
                <n-card title="热门排行" size="small">
                  <n-list v-if="hotRanking.length">
                    <n-list-item
                      v-for="video in hotRanking"
                      :key="video.id"
                      class="hot-ranking-item"
                      @click="goToVideoDetail(String(video.id))"
                    >
                      <n-thing>
                        <template #avatar>
                          <img
                            class="hot-cover"
                            :src="resolveApiUrl(video.coverUrl) || getFallbackCover(video.id ?? '')"
                            alt="cover"
                          />
                        </template>
                        <template #header>
                          <n-text strong>{{ video.title || '未命名视频' }}</n-text>
                        </template>
                        <template #description>
                          <n-text depth="3">播放 {{ video.playCount || 0 }}</n-text>
                        </template>
                      </n-thing>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="暂无排行数据" />
                </n-card>
              </n-gi>
              <n-gi>
                <n-card title="用户行为" size="small">
                  <n-descriptions v-if="behaviorItems.length" :column="1" size="small">
                    <n-descriptions-item v-for="item in behaviorItems" :key="item.key" :label="item.label">
                      {{ item.value }}
                    </n-descriptions-item>
                  </n-descriptions>
                  <n-empty v-else description="暂无行为数据" />
                </n-card>
              </n-gi>
            </n-grid>
          </div>

          <div class="home-section" v-else-if="section === 'recent' && recentCollections.length > 0">
            <div class="recent-collections">
              <h3>最近观看</h3>
              <n-grid class="recent-grid" :cols="5" :x-gap="16" :y-gap="16">
                <n-gi v-for="collection in recentCollections" :key="collection.id">
                  <n-card hoverable @click="goToVideoDetail(collection.id)">
                    <template #cover>
                      <div class="collection-cover">
                        <img
                          class="collection-cover-img"
                          :src="resolveApiUrl(collection.cover) || getFallbackCover(collection.id ?? '')"
                          alt="cover"
                        />
                        <div class="recent-type-badge">{{ collection.kindLabel }}</div>
                      </div>
                    </template>
                    <n-ellipsis :tooltip="false">
                      {{ collection.title }}
                    </n-ellipsis>
                    <div class="collection-info">
                      <n-text depth="3" style="font-size: 12px">
                        {{ collection.totalEpisodes }} 集
                      </n-text>
                    </div>
                  </n-card>
                </n-gi>
              </n-grid>
            </div>
          </div>

          <n-divider />
        </template>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '@/store/video'
import { videoStatisticsApi } from '@/api/video'
import { resolveApiUrl } from '@/utils/api'
import { getFallbackCover } from '@/utils/fallbackCover'
import type { BackendVideo, BackendVideoCollection } from '@/types'
import {
  VideoLibraryOutline as VideoLibraryIcon,
  PlayOutline as PlayIcon,
  TimeOutline as TimeIcon,
  SettingsOutline as SettingsIcon,
  SwapVerticalOutline as SwapVerticalIcon,
  ChevronUpOutline as ChevronUpIcon,
  ChevronDownOutline as ChevronDownIcon
} from '@vicons/ionicons5'

const router = useRouter()
const videoStore = useVideoStore()
const videoLibraryIcon = VideoLibraryIcon || null
const playIcon = PlayIcon || null
const timeIcon = TimeIcon || null
const settingsIcon = SettingsIcon || null
const ORDER_STORAGE_KEY = 'home_section_order'
const defaultSectionOrder = ['stats', 'quick', 'panels', 'recent'] as const
const sectionLabelMap: Record<typeof defaultSectionOrder[number], string> = {
  stats: '统计概览',
  quick: '快速操作',
  panels: '热门排行/用户行为',
  recent: '最近观看'
}

const readSectionOrder = () => {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY)
    if (!raw) return [...defaultSectionOrder]
    const parsed = JSON.parse(raw) as string[]
    const filtered = parsed.filter(item => defaultSectionOrder.includes(item as any))
    const rest = defaultSectionOrder.filter(item => !filtered.includes(item))
    return [...filtered, ...rest]
  } catch {
    return [...defaultSectionOrder]
  }
}

const sectionOrder = ref<(typeof defaultSectionOrder[number])[]>(readSectionOrder())
const orderedSections = computed(() => sectionOrder.value)
const showOrderDrawer = ref(false)
const isMobile = ref(window.innerWidth <= 768)

const persistSectionOrder = () => {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(sectionOrder.value))
}

const moveSection = (section: typeof defaultSectionOrder[number], offset: number) => {
  const index = sectionOrder.value.indexOf(section)
  const target = index + offset
  if (index < 0 || target < 0 || target >= sectionOrder.value.length) return
  const nextOrder = [...sectionOrder.value]
  const temp = nextOrder[index]
  nextOrder[index] = nextOrder[target]
  nextOrder[target] = temp
  sectionOrder.value = nextOrder
  persistSectionOrder()
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

const hotRanking = ref<BackendVideo[]>([])
const userBehavior = ref<Record<string, any>>({})

const totalVideos = computed(() => {
  return videoStore.collections.reduce((sum, col) => sum + col.totalEpisodes, 0)
})

type RecentCollectionDisplay = {
  id: string
  title: string
  cover: string
  totalEpisodes: number
  kindLabel: string
}

const resolveRecentCover = (entity: BackendVideo | BackendVideoCollection) => {
  return resolveApiUrl(entity.coverUrl) || getFallbackCover(entity.id ?? '')
}

const recentCollections = computed<RecentCollectionDisplay[]>(() => {
  const items = (videoStore.recentPlayList || [])
    .map((item) => {
      const isCollection = item.itemType === 'collection' || (!!item.collection && !item.video)
      if (isCollection && item.collection) {
        return {
          id: String(item.collection.id ?? ''),
          title: item.collection.title || '未命名合集',
          cover: resolveRecentCover(item.collection),
          totalEpisodes: Math.max(1, item.collection.videoCount ?? 1),
          kindLabel: '合集'
        }
      }
      if (item.video && item.video.id) {
        return {
          id: String(item.video.id ?? ''),
          title: item.video.title || '未命名视频',
          cover: resolveRecentCover(item.video),
          totalEpisodes: 1,
          kindLabel: '视频'
        }
      }
      return null
    })
    .filter((item): item is RecentCollectionDisplay => Boolean(item))
  return items.slice(0, 5)
})

const behaviorLabelMap: Record<string, string> = {
  playCount: '播放次数',
  totalPlayCount: '总播放',
  likeCount: '点赞次数',
  commentCount: '评论次数',
  collectCount: '收藏次数',
  favoriteCount: '收藏次数',
  videoCount: '视频数量',
  userCount: '用户数量',
  todayPlayCount: '今日播放',
  weekPlayCount: '本周播放',
  monthPlayCount: '本月播放',
  lastPlayTime: '最近播放',
  lastActiveTime: '最近活跃',
  totalWatchTime: '观看时长',
  watchedVideoCount: '观看视频数',
  recentWatchedVideos: '最近观看'
}

const formatBehaviorLabel = (key: string) => {
  return behaviorLabelMap[key] || key
}

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0 分钟'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h} 小时 ${m} 分钟`
  if (m > 0) return `${m} 分钟 ${s} 秒`
  return `${s} 秒`
}

const formatRecentWatched = (value: unknown) => {
  if (!Array.isArray(value)) return '暂无'
  if (value.length === 0) return '暂无'
  const names = value
    .map((item: any) => item?.title || item?.name || item?.videoTitle || item?.collectionTitle || item?.id)
    .filter(Boolean)
    .slice(0, 3)
    .map((item: any) => String(item))
  const countText = `${value.length} 条`
  if (names.length === 0) return countText
  return `${countText}（${names.join('、')}${value.length > names.length ? ' 等' : ''}）`
}

const formatBehaviorValue = (key: string, value: unknown) => {
  if (value === null || value === undefined || value === '') return '暂无'
  if (key === 'recentWatchedVideos') {
    return formatRecentWatched(value)
  }
  if (typeof value === 'number') {
    if (key.toLowerCase().includes('time')) {
      return formatDuration(value)
    }
    if (value > 1e12) {
      return new Date(value).toLocaleString()
    }
    return value.toLocaleString()
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '暂无'
    return `${value.length} 条`
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toLocaleString()
    }
    return value
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '暂无'
    return entries.map(([k, v]) => `${k}: ${String(v)}`).join('，')
  }
  return String(value)
}

const behaviorItems = computed(() => {
  return Object.entries(userBehavior.value).map(([key, value]) => ({
    key,
    label: formatBehaviorLabel(key),
    value: formatBehaviorValue(key, value)
  }))
})

const playRecordCount = computed(() => {
  const countFromBehavior = userBehavior.value?.watchedVideoCount
    ?? userBehavior.value?.playCount
    ?? userBehavior.value?.totalPlayCount
  if (typeof countFromBehavior === 'number') {
    return countFromBehavior
  }
  return videoStore.recentPlayList?.length || 0
})

const goToVideo = () => {
  router.push({ name: 'video' })
}

const goToSettings = () => {
  router.push({ name: 'settings' })
}

const goToVideoDetail = (id: string) => {
  router.push({ name: 'videoDetail', params: { id } })
}

const loadStatistics = async () => {
  try {
    hotRanking.value = await videoStatisticsApi.getHotRanking()
  } catch (error) {
    hotRanking.value = []
  }

  try {
    userBehavior.value = await videoStatisticsApi.getUserBehavior()
  } catch (error) {
    userBehavior.value = {}
  }
}

onMounted(() => {
  loadStatistics()
  videoStore.loadRecentPlayList(5)
  window.addEventListener('resize', handleResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  padding: 40px 0;

  h1 {
    font-size: 32px;
    margin-bottom: 10px;
  }

  p {
    font-size: 16px;
    color: var(--n-text-color);
    opacity: 0.7;
  }
}

.quick-actions,
.recent-collections {
  h3 {
    margin-bottom: 16px;
  }
}

.quick-order-list {
  margin-top: 6px;
}

.section-order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  background: var(--n-color);
}

.section-order-label {
  font-size: 12px;
  color: var(--n-text-color-2);
}

.collection-cover {
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--n-color);
  color: var(--n-text-color);
  opacity: 0.5;
}

.collection-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  background: #111;
}

.recent-type-badge {
  position: absolute;
  right: 8px;
  top: 8px;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 6px;
  border-radius: 8px;
}

.hot-cover {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  background: #111;
}

.hot-ranking-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
}

.hot-ranking-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.collection-info {
  margin-top: 8px;
}

@media (max-width: 900px) {
  .home-stats-grid,
  .home-panels-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }

  .recent-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 600px) {
  .recent-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }
}
</style>
