<template>
  <div class="home-view">
    <n-card>
      <n-space vertical :size="20">
        <div class="welcome-section">
          <h1>欢迎使用 PiliPili Video</h1>
          <p>您的局域网视频播放平台</p>
        </div>

        <n-grid :cols="3" :x-gap="20" :y-gap="20">
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

        <div class="recent-collections" v-if="recentCollections.length > 0">
          <h3>最近观看</h3>
          <n-grid :cols="5" :x-gap="16" :y-gap="16">
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '@/store/video'
import { 
  VideoLibraryOutline as VideoLibraryIcon, 
  PlayOutline as PlayIcon, 
  TimeOutline as TimeIcon, 
  SettingsOutline as SettingsIcon 
} from '@vicons/ionicons5'

const router = useRouter()
const videoStore = useVideoStore()

const totalVideos = computed(() => {
  return videoStore.collections.reduce((sum, col) => sum + col.videos.length, 0)
})

const recentCollections = computed(() => {
  // 根据播放记录获取最近观看的合集
  const recentIds = Array.from(videoStore.playRecords.values())
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
    .slice(0, 5)
    .map(r => r.collectionId)
    .filter(Boolean) as string[]

  return videoStore.collections
    .filter(col => recentIds.includes(col.id))
    .slice(0, 5)
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
</style>
