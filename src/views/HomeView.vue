<template>
  <div class="home-view">
    <n-card>
      <n-space vertical :size="20">
        <div class="welcome-section">
          <h1>欢迎使用 PiliPili Video</h1>
          <p>您的局域网视频播放平台</p>
        </div>

        <n-grid class="home-stats-grid" :cols="3" :x-gap="20" :y-gap="20">
          <n-gi>
            <n-statistic label="视频合集" :value="videoStore.collections.length">
              <template #suffix>
                <n-icon><VideoLibraryIcon /></n-icon>
              </template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="视频总数" :value="totalVideos">
              <template #suffix>
                <n-icon><PlayIcon /></n-icon>
              </template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="播放记录" :value="videoStore.playRecords.size">
              <template #suffix>
                <n-icon><TimeIcon /></n-icon>
              </template>
            </n-statistic>
          </n-gi>
        </n-grid>

        <n-divider />

        <div class="quick-actions">
          <h3>快速操作</h3>
          <n-space>
            <n-button type="primary" @click="goToVideo">
              <template #icon>
                <n-icon><PlayIcon /></n-icon>
              </template>
              浏览视频
            </n-button>
            <n-button @click="goToSettings">
              <template #icon>
                <n-icon><SettingsIcon /></n-icon>
              </template>
              配置文件夹
            </n-button>
          </n-space>
        </div>

        <n-divider />

        <n-grid class="home-panels-grid" :cols="2" :x-gap="20" :y-gap="20">
          <n-gi>
            <n-card title="热门排行" size="small">
              <n-list v-if="hotRanking.length">
                <n-list-item v-for="video in hotRanking" :key="video.id" @click="goToVideoDetail(String(video.id))">
                  <n-thing>
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
              <n-descriptions v-if="behaviorEntries.length" :column="1" size="small">
                <n-descriptions-item v-for="item in behaviorEntries" :key="item[0]" :label="item[0]">
                  {{ item[1] }}
                </n-descriptions-item>
              </n-descriptions>
              <n-empty v-else description="暂无行为数据" />
            </n-card>
          </n-gi>
        </n-grid>

        <n-divider />

        <div class="recent-collections" v-if="recentCollections.length > 0">
          <h3>最近观看</h3>
          <n-grid class="recent-grid" :cols="5" :x-gap="16" :y-gap="16">
            <n-gi v-for="collection in recentCollections" :key="collection.id">
              <n-card hoverable @click="goToVideoDetail(collection.id)">
                <template #cover>
                  <div class="collection-cover">
                    <n-icon size="40"><VideoLibraryIcon /></n-icon>
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
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '@/store/video'
import { videoStatisticsApi } from '@/api/video'
import type { BackendVideo } from '@/types'
import {
  VideoLibraryOutline as VideoLibraryIcon,
  PlayOutline as PlayIcon,
  TimeOutline as TimeIcon,
  SettingsOutline as SettingsIcon
} from '@vicons/ionicons5'

const router = useRouter()
const videoStore = useVideoStore()

const hotRanking = ref<BackendVideo[]>([])
const userBehavior = ref<Record<string, any>>({})

const totalVideos = computed(() => {
  return videoStore.collections.reduce((sum, col) => sum + col.totalEpisodes, 0)
})

const recentCollections = computed(() => {
  const recentIds = Array.from(videoStore.playRecords.values())
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
    .slice(0, 5)
    .map(r => r.collectionId)
    .filter(Boolean) as string[]

  return videoStore.collections
    .filter(col => recentIds.includes(col.id))
    .slice(0, 5)
})

const behaviorEntries = computed(() => Object.entries(userBehavior.value))

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

.collection-cover {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--n-color);
  color: var(--n-text-color);
  opacity: 0.5;
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
