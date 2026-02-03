<template>
  <div class="video-detail" v-if="collection">
    <n-card>
      <n-space vertical :size="20">
        <div class="video-info">
          <h1>{{ collection.title }}</h1>
          <n-text depth="3">{{ collection.description }}</n-text>
        </div>

        <div class="player-section">
          <VideoPlayer
            ref="playerRef"
            :collection="collection"
            :initial-episode="currentEpisodeIndex"
            @episode-change="handleEpisodeChange"
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

        <n-card title="分集列表">
          <n-list>
            <n-list-item
              v-for="(video, index) in collection.videos"
              :key="video.id"
              :class="{ 'episode-active': index === currentEpisodeIndex }"
              @click="switchEpisode(index)"
            >
              <n-thing>
                <template #header>
                  <n-space align="center">
                    <n-text :type="index === currentEpisodeIndex ? 'primary' : 'default'">
                      第 {{ index + 1 }} 集
                    </n-text>
                    <n-tag v-if="index === currentEpisodeIndex" type="info" size="small">
                      正在播放
                    </n-tag>
                  </n-space>
                </template>
                <template #description>
                  <n-text depth="3">{{ video.name }}</n-text>
                  <n-space style="margin-top: 8px">
                    <n-text depth="3" style="font-size: 12px">
                      {{ formatFileSize(video.size) }}
                    </n-text>
                    <n-text depth="3" style="font-size: 12px" v-if="video.duration">
                      {{ formatDuration(video.duration) }}
                    </n-text>
                  </n-space>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
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

        <n-card title="相关视频" size="small">
          <n-list v-if="relatedVideos.length">
            <n-list-item v-for="video in relatedVideos" :key="video.id" @click="goToRelatedVideo(video.id)">
              <n-thing>
                <template #header>
                  <n-space align="center">
                    <n-text strong>{{ video.title || '未命名视频' }}</n-text>
                    <n-tag size="small" type="info" v-if="video.categoryName">{{ video.categoryName }}</n-tag>
                  </n-space>
                </template>
                <template #description>
                  <n-text depth="3">{{ video.userName || '未知作者' }}</n-text>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
          <n-empty v-else description="暂无相关视频" />
        </n-card>

        <n-card title="弹幕" size="small">
          <DanmakuPanel :video-id="currentVideoId" :get-current-time="getCurrentTime" />
        </n-card>

        <n-card title="评论区">
          <CommentSection :video-id="currentVideoId" :collection-id="collection.id" />
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useVideoStore } from '@/store/video'
import VideoPlayer from '@/components/VideoPlayer.vue'
import CommentSection from '@/components/CommentSection.vue'
import DanmakuPanel from '@/components/DanmakuPanel.vue'
import { formatFileSize, formatDuration } from '@/utils/format'
import { isNumericId } from '@/utils/id'
import { getErrorMessage } from '@/utils/error'
import { videoApi, videoSearchApi, videoStatisticsApi } from '@/api/video'
import { likeApi, collectApi } from '@/api/interaction'
import type { BackendVideo, VideoCollection, VideoFile } from '@/types'
import {
  HeartOutline as HeartOutlineIcon,
  Heart as HeartIcon,
  BookmarkOutline as BookmarkOutlineIcon,
  Bookmark as BookmarkIcon
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const videoStore = useVideoStore()

const collectionId = computed(() => route.params.id as string)
const currentEpisodeIndex = ref(0)
const fallbackCollection = ref<VideoCollection | null>(null)
const playerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)

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

const getCurrentTime = () => {
  return playerRef.value?.getCurrentTime ? playerRef.value.getCurrentTime() : 0
}

const toTimestamp = (value?: string) => {
  if (!value) return Date.now()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

const mapVideoToFile = (video: BackendVideo): VideoFile => {
  return {
    id: String(video.id ?? ''),
    name: video.title || '视频',
    path: video.videoUrl || '',
    size: Number(video.fileSize || 0),
    modifiedTime: toTimestamp(video.updateTime || video.createTime),
    format: video.format || 'mp4',
    duration: video.duration ?? undefined,
    thumbnail: video.coverUrl
  }
}

const buildSingleCollection = (video: BackendVideo): VideoCollection => {
  return {
    id: String(video.id ?? collectionId.value),
    title: video.title || '视频',
    description: video.description || '',
    cover: video.coverUrl,
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

  const firstVideo = collection.value.videos[0]
  const record = await videoStore.getPlayRecord(firstVideo.id)
  if (record && typeof record.episodeIndex === 'number') {
    currentEpisodeIndex.value = record.episodeIndex
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

const toggleLike = async () => {
  if (!currentVideoId.value) return
  const next = !isLiked.value
  try {
    await likeApi.setLike(currentVideoId.value, next)
    isLiked.value = next
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
})

watch(collectionId, async (newId) => {
  currentEpisodeIndex.value = 0
  await loadCollectionData(newId)
})

watch(collection, () => {
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

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }
}
</style>
