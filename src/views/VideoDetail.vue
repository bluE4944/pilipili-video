<template>
  <div class="video-detail" v-if="collection">
    <n-card>
      <n-space vertical :size="20">
        <!-- 视频信息 -->
        <div class="video-info">
          <h1>{{ collection.title }}</h1>
          <n-text depth="3">{{ collection.description }}</n-text>
        </div>

        <!-- 播放器区域 -->
        <div class="player-section">
          <VideoPlayer
            :collection="collection"
            :initial-episode="currentEpisodeIndex"
            @episode-change="handleEpisodeChange"
          />
        </div>

        <!-- 分集列表 -->
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

        <!-- 评论区 -->
        <n-card title="评论区">
          <CommentSection :video-id="currentVideoId" :collection-id="collection.id" />
        </n-card>
      </n-space>
    </n-card>
  </div>
  <n-result v-else status="404" title="视频不存在" description="请检查视频ID是否正确">
    <template #footer>
      <n-button @click="$router.push({ name: 'video' })">返回视频列表</n-button>
    </template>
  </n-result>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVideoStore } from '@/store/video'
import VideoPlayer from '@/components/VideoPlayer.vue'
import CommentSection from '@/components/CommentSection.vue'
import { formatFileSize, formatDuration } from '@/utils/format'

const route = useRoute()
const videoStore = useVideoStore()

const collectionId = route.params.id as string
const currentEpisodeIndex = ref(0)

const collection = computed(() => {
  return videoStore.collections.find(c => c.id === collectionId) || null
})

const currentVideoId = computed(() => {
  if (!collection.value || collection.value.videos.length === 0) return ''
  return collection.value.videos[currentEpisodeIndex.value]?.id || ''
})

const applyPlayRecordEpisode = async () => {
  if (!collection.value || collection.value.videos.length === 0) return

  const firstVideo = collection.value.videos[0]
  const record = await videoStore.getPlayRecord(firstVideo.id)
  if (record && typeof record.episodeIndex === 'number') {
    currentEpisodeIndex.value = record.episodeIndex
  }
}

onMounted(() => {
  applyPlayRecordEpisode()
})

watch(collection, () => {
  applyPlayRecordEpisode()
})

const switchEpisode = (index: number) => {
  currentEpisodeIndex.value = index
  if (collection.value) {
    videoStore.setCurrentVideo(collection.value, index)
  }
}

const handleEpisodeChange = (index: number) => {
  currentEpisodeIndex.value = index
}
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
</style>
