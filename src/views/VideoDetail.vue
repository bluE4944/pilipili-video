<template>
  <div class="video-detail" v-if="collection">
    <n-card>
      <n-space vertical :size="20">
        <div class="video-info">
          <div class="video-info-actions">
            <n-tooltip>
              <template #trigger>
                <n-button circle secondary class="video-back-button" @click="handleBack">
                  <template #icon>
                    <n-icon v-if="backIcon">
                      <component :is="backIcon" />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              返回
            </n-tooltip>
          </div>
          <h1>{{ collection.title }}</h1>
          <n-text depth="3">{{ collection.description }}</n-text>
        </div>

        <div class="player-section">
          <VideoPlayer
            v-if="playerReady"
            ref="playerRef"
            :collection="collection"
            :initial-episode="currentEpisodeIndex"
            @episode-change="handleEpisodeChange"
            @play-counted="handlePlayCounted"
          />
        </div>

        <n-card title="互动操作" size="small">
          <n-space justify="space-between" align="center" :wrap="true">
            <n-space>
              <n-tooltip>
                <template #trigger>
                  <n-button
                    circle
                    secondary
                    :type="isLiked ? 'error' : 'default'"
                    @click="toggleLike"
                    :disabled="!currentVideoId"
                  >
                    <n-icon>
                      <HeartIcon v-if="isLiked" />
                      <HeartOutlineIcon v-else />
                    </n-icon>
                  </n-button>
                </template>
                <span>{{ isLiked ? '取消点赞' : '点赞' }}</span>
              </n-tooltip>
              <n-tooltip>
                <template #trigger>
                  <n-button
                    circle
                    secondary
                    :type="isCollected ? 'warning' : 'default'"
                    @click="toggleCollect"
                    :disabled="!currentVideoId"
                  >
                    <n-icon>
                      <BookmarkIcon v-if="isCollected" />
                      <BookmarkOutlineIcon v-else />
                    </n-icon>
                  </n-button>
                </template>
                <span>{{ isCollected ? '取消收藏' : '收藏' }}</span>
              </n-tooltip>
            </n-space>
            <n-space>
              <n-statistic label="播放" :value="currentVideoInfo?.playCount || 0" />
              <n-statistic label="点赞" :value="currentVideoInfo?.likeCount || 0" />
              <n-statistic label="评论" :value="currentVideoInfo?.commentCount || 0" />
              <n-statistic label="收藏" :value="currentVideoInfo?.collectCount || 0" />
            </n-space>
          </n-space>
        </n-card>

        <n-card title="分集列表" v-if="collection.videos.length > 1">
          <div class="episodes-grid">
            <n-tooltip v-for="(video, index) in collection.videos" :key="video.id">
              <template #trigger>
                <n-button
                  size="small"
                  class="episode-button"
                  :type="index === currentEpisodeIndex ? 'primary' : 'default'"
                  :secondary="index !== currentEpisodeIndex"
                  @click="switchEpisode(index)"
                >
                  第 {{ index + 1 }} 集
                </n-button>
              </template>
              <div class="episode-tooltip">
                <div class="episode-tooltip-title">{{ video.name }}</div>
                <div class="episode-tooltip-meta" v-if="video.duration">
                  时长 {{ formatDuration(video.duration) }}
                </div>
              </div>
            </n-tooltip>
          </div>
        </n-card>

        <n-grid class="detail-grid" :cols="24" :x-gap="16" :y-gap="16">
          <n-gi :span="14">
            <n-card title="数据统计" size="small">
              <n-descriptions v-if="videoStatsEntries.length" :column="2" size="small">
                <n-descriptions-item v-for="item in videoStatsEntries" :key="item[0]" :label="item[0]">
                  {{ item[1] }}
                </n-descriptions-item>
              </n-descriptions>
              <n-empty v-else description="暂无统计数据" />
            </n-card>
          </n-gi>
          <n-gi :span="10">
            <n-card title="播放趋势" size="small">
              <n-list v-if="trendEntries.length">
                <n-list-item v-for="item in trendEntries" :key="item[0]">
                  <n-space justify="space-between" style="width: 100%">
                    <n-text>{{ item[0] }}</n-text>
                    <n-text>{{ item[1] }}</n-text>
                  </n-space>
                </n-list-item>
              </n-list>
              <n-empty v-else description="暂无趋势数据" />
            </n-card>
          </n-gi>
        </n-grid>

        <n-card title="弹幕" size="small">
          <DanmakuPanel :video-id="currentVideoId" :get-current-time="getCurrentTime" />
        </n-card>

        <n-card title="评论区">
          <CommentSection
            :video-id="currentVideoId"
            :collection-id="collection.id"
            @submitted="refreshCurrentVideoData"
          />
        </n-card>

        <n-card title="相关视频" size="small">
          <n-grid
            v-if="relatedGridItems.length"
            class="related-grid"
            :cols="relatedColumns"
            :x-gap="12"
            :y-gap="12"
          >
            <n-gi v-for="video in relatedGridItems" :key="video.id">
              <div class="related-card" @click="goToRelatedVideo(Number(video.id))">
                <div class="related-cover">
                  <img :src="video.cover" alt="cover" />
                  <div class="related-title">{{ video.title || '未命名视频' }}</div>
                  <div class="related-plays">
                    <n-icon v-if="playIcon" class="play-icon">
                      <component :is="playIcon" />
                    </n-icon>
                    <span>{{ video.playCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </n-gi>
          </n-grid>
          <n-empty v-else description="暂无相关视频" />
        </n-card>
      </n-space>
    </n-card>
  </div>
  <n-result v-else status="404" title="视频不存在" description="请检查视频 ID 是否正确">
    <template #footer>
      <n-button @click="$router.push({ name: 'video' })">返回视频列表</n-button>
    </template>
  </n-result>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useVideoStore } from '@/store/video'
import VideoPlayer from '@/components/VideoPlayer.vue'
import CommentSection from '@/components/CommentSection.vue'
import DanmakuPanel from '@/components/DanmakuPanel.vue'
import { formatFileSize, formatDuration } from '@/utils/format'
import { isNumericId } from '@/utils/id'
import { getErrorMessage } from '@/utils/error'
import { resolveApiUrl } from '@/utils/api'
import { getFallbackCover } from '@/utils/fallbackCover'
import { videoApi, videoSearchApi, videoStatisticsApi } from '@/api/video'
import { likeApi, collectApi } from '@/api/interaction'
import type { BackendVideo, VideoCollection, VideoFile } from '@/types'
import {
  HeartOutline as HeartOutlineIcon,
  Heart as HeartIcon,
  BookmarkOutline as BookmarkOutlineIcon,
  Bookmark as BookmarkIcon,
  PlayOutline as PlayIcon,
  ArrowBackOutline as ArrowBackOutlineIcon
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const videoStore = useVideoStore()
const backIcon = ArrowBackOutlineIcon || null
const playIcon = PlayIcon || null

const collectionId = computed(() => route.params.id as string)
const currentEpisodeIndex = ref(0)
const fallbackCollection = ref<VideoCollection | null>(null)
const playerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)
const playerReady = ref(false)

const collection = computed(() => {
  return videoStore.collections.find(c => c.id === collectionId.value) || fallbackCollection.value
})

const currentVideoId = computed(() => {
  if (!collection.value || collection.value.videos.length === 0) return ''
  return collection.value.videos[currentEpisodeIndex.value]?.id || ''
})

const currentVideoInfo = ref<BackendVideo | null>(null)
const isLiked = ref(false)
const isCollected = ref(false)
const relatedVideos = ref<BackendVideo[]>([])
const videoStats = ref<Record<string, any>>({})
const videoTrend = ref<Record<string, number>>({})

const videoStatsEntries = computed(() => Object.entries(videoStats.value))
const trendEntries = computed(() => Object.entries(videoTrend.value))
const relatedDisplayItems = computed(() => {
  return (relatedVideos.value || [])
    .filter(video => video && video.id)
    .map(video => ({
      id: String(video.id ?? ''),
      title: video.title || '未命名视频',
      cover: resolveApiUrl(video.coverUrl) || getFallbackCover(video.id ?? ''),
      playCount: video.playCount ?? 0
    }))
})
const windowWidth = ref(window.innerWidth)
const relatedColumns = computed(() => {
  if (windowWidth.value >= 1200) return 5
  if (windowWidth.value >= 900) return 4
  if (windowWidth.value >= 640) return 3
  return 2
})
const relatedGridItems = computed(() => {
  return relatedDisplayItems.value.slice(0, relatedColumns.value * 2)
})

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'video' })
  }
}

const getCurrentTime = () => {
  return playerRef.value?.getCurrentTime ? playerRef.value.getCurrentTime() : 0
}

const toTimestamp = (value?: string) => {
  if (!value) return Date.now()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

const resolveVideoFormat = (...candidates: Array<string | undefined>) => {
  for (const candidate of candidates) {
    if (!candidate) continue
    const normalized = candidate.trim()
    if (!normalized) continue
    if (/^[a-z0-9]+$/i.test(normalized)) {
      return normalized.toLowerCase()
    }
    const pureValue = normalized.split('?')[0].split('#')[0]
    const lastDotIndex = pureValue.lastIndexOf('.')
    if (lastDotIndex >= 0 && lastDotIndex < pureValue.length - 1) {
      return pureValue.substring(lastDotIndex + 1).toLowerCase()
    }
  }
  return 'mp4'
}

const mapVideoToFile = (video: BackendVideo): VideoFile => {
  return {
    id: String(video.id ?? ''),
    name: video.title || '视频',
    path: video.videoUrl || '',
    size: Number(video.fileSize || 0),
    modifiedTime: toTimestamp(video.updateTime || video.createTime),
    format: resolveVideoFormat(video.format, video.videoUrl, video.title),
    duration: video.duration ?? undefined,
    thumbnail: resolveApiUrl(video.coverUrl) || getFallbackCover(video.id ?? '')
  }
}

const buildSingleCollection = (video: BackendVideo): VideoCollection => {
  return {
    id: String(video.id ?? collectionId.value),
    title: video.title || '视频',
    description: video.description || '',
    cover: resolveApiUrl(video.coverUrl) || getFallbackCover(video.id ?? ''),
    videos: [mapVideoToFile(video)],
    totalEpisodes: 1,
    createdAt: toTimestamp(video.createTime),
    updatedAt: toTimestamp(video.updateTime)
  }
}

const loadCollectionData = async (id: string) => {
  fallbackCollection.value = null
  try {
    await videoStore.loadCollectionDetail(id)
  } catch (error) {
    try {
      const video = await videoApi.getVideoById(id)
      fallbackCollection.value = buildSingleCollection(video)
    } catch (innerError) {
      console.error('Failed to load collection or video:', innerError)
    }
  }
}

const applyPlayRecordEpisode = async () => {
  if (!collection.value || collection.value.videos.length === 0) return
  const record = await videoStore.getPlayRecordByCollection(collection.value)
  if (record && typeof record.episodeIndex === 'number') {
    currentEpisodeIndex.value = record.episodeIndex
  } else {
    currentEpisodeIndex.value = 0
  }
  if (collection.value) {
    videoStore.setCurrentVideo(collection.value, currentEpisodeIndex.value)
  }
}

const switchEpisode = (index: number) => {
  currentEpisodeIndex.value = index
  if (collection.value) {
    videoStore.setCurrentVideo(collection.value, index)
  }
}

const handleEpisodeChange = (index: number) => {
  currentEpisodeIndex.value = index
}

const handlePlayCounted = (videoId: string, playCount?: number) => {
  if (!currentVideoInfo.value) return
  const currentId = String(currentVideoInfo.value.id ?? '')
  if (!currentId || currentId !== videoId) return
  const normalized = typeof playCount === 'number'
    ? playCount
    : Number(playCount)
  const base = Number(currentVideoInfo.value.playCount ?? 0)
  const next = Number.isFinite(normalized)
    ? normalized
    : (Number.isFinite(base) ? base : 0) + 1
  currentVideoInfo.value = {
    ...currentVideoInfo.value,
    playCount: next
  }
  if (videoStats.value && typeof videoStats.value.playCount === 'number') {
    videoStats.value = {
      ...videoStats.value,
      playCount: next
    }
  }
}

const loadVideoInfo = async (videoId: string) => {
  if (!isNumericId(videoId)) {
    currentVideoInfo.value = null
    return
  }
  try {
    currentVideoInfo.value = await videoApi.getVideoById(videoId)
  } catch (error) {
    console.error('Failed to load video info:', error)
    currentVideoInfo.value = null
  }
}

const loadInteractions = async (videoId: string) => {
  if (!isNumericId(videoId)) {
    isLiked.value = false
    isCollected.value = false
    return
  }
  try {
    isLiked.value = await likeApi.isLiked(videoId)
  } catch (error) {
    isLiked.value = false
  }

  try {
    isCollected.value = await collectApi.isCollected(videoId)
  } catch (error) {
    isCollected.value = false
  }
}

const loadStatistics = async (videoId: string) => {
  if (!isNumericId(videoId)) {
    videoStats.value = {}
    videoTrend.value = {}
    return
  }
  try {
    videoStats.value = await videoStatisticsApi.getVideoStatistics(videoId)
  } catch (error) {
    videoStats.value = {}
  }

  try {
    videoTrend.value = await videoStatisticsApi.getVideoTrend(videoId)
  } catch (error) {
    videoTrend.value = {}
  }
}

const loadRelatedVideos = async (videoId: string) => {
  if (!isNumericId(videoId)) {
    relatedVideos.value = []
    return
  }
  try {
    relatedVideos.value = await videoSearchApi.getRelatedVideos(videoId)
  } catch (error) {
    relatedVideos.value = []
  }
}

const refreshCurrentVideoData = async () => {
  if (!currentVideoId.value || !isNumericId(currentVideoId.value)) return
  await loadVideoInfo(currentVideoId.value)
  await loadStatistics(currentVideoId.value)
}

const toggleLike = async () => {
  if (!currentVideoId.value) return
  const next = !isLiked.value
  try {
    await likeApi.setLike(currentVideoId.value, next)
    isLiked.value = next
    await refreshCurrentVideoData()
    message.success(next ? '已点赞' : '已取消点赞')
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const toggleCollect = async () => {
  if (!currentVideoId.value) return
  const next = !isCollected.value
  try {
    if (next) {
      await collectApi.collectVideo(currentVideoId.value)
    } else {
      await collectApi.cancelCollect(currentVideoId.value)
    }
    isCollected.value = next
    await refreshCurrentVideoData()
    message.success(next ? '已收藏' : '已取消收藏')
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const goToRelatedVideo = (id?: number) => {
  if (!id) return
  router.push({ name: 'videoDetail', params: { id: String(id) } })
}

onMounted(async () => {
  await loadCollectionData(collectionId.value)
  await applyPlayRecordEpisode()
  playerReady.value = true
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watch(collectionId, async (newId) => {
  currentEpisodeIndex.value = 0
  playerReady.value = false
  await loadCollectionData(newId)
  await applyPlayRecordEpisode()
  playerReady.value = true
})

watch(collection, () => {
  if (!playerReady.value) return
  applyPlayRecordEpisode()
})

watch(currentVideoId, async (newVideoId) => {
  if (!newVideoId) return
  if (!isNumericId(newVideoId)) {
    currentVideoInfo.value = null
    isLiked.value = false
    isCollected.value = false
    relatedVideos.value = []
    videoStats.value = {}
    videoTrend.value = {}
    return
  }
  await loadVideoInfo(newVideoId)
  await loadInteractions(newVideoId)
  await loadStatistics(newVideoId)
  await loadRelatedVideos(newVideoId)
})
</script>

<style scoped lang="scss">
.video-detail {
  max-width: 1400px;
  margin: 0 auto;
}

.video-info {
  h1 {
    font-size: 24px;
    margin-bottom: 8px;
  }
}

.video-back-button {
  font-size: 14px;
  color: var(--n-text-color-2);
}

.video-info-actions {
  margin-bottom: 8px;
}

.player-section {
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.episode-active {
  background: var(--n-color-hover);
  border-radius: 4px;
}

.episodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 10px;
}

.episode-button {
  width: 100%;
  justify-content: center;
}

.episode-tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.episode-tooltip-meta {
  font-size: 12px;
  opacity: 0.8;
}

.related-grid {
  width: 100%;
}

.related-card {
  cursor: pointer;
}

.related-cover {
  position: relative;
  height: 124px;
  border-radius: 10px;
  overflow: hidden;
  background: #111;
}

.related-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-title {
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

.related-plays {
  position: absolute;
  right: 8px;
  bottom: 8px;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 6px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.play-icon {
  font-size: 12px;
  line-height: 1;
}

@media (max-width: 1200px) {
  .related-cover {
    height: 110px;
  }
}

@media (max-width: 900px) {
  .related-cover {
    height: 100px;
  }
}

@media (max-width: 768px) {
  .related-cover {
    height: 90px;
  }

  .related-title,
  .related-plays {
    font-size: 11px;
    padding: 2px 5px;
  }
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }
}
</style>
