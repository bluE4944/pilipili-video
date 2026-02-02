<template>
  <div class="video-player-wrapper">
    <div v-if="!videoFile" class="player-placeholder">
      <n-empty description="请选择要播放的视频">
        <template #extra>
          <n-button @click="loadFirstVideo">播放第一集</n-button>
        </template>
      </n-empty>
    </div>
    <div v-show="videoFile" class="video-player-container">
      <video
        ref="playerRef"
        class="video-js vjs-big-play-centered"
        playsinline
      ></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'
import type { VideoCollection, VideoFile, PlayRecord } from '@/types'
import { useVideoStore } from '@/store/video'
import { useMessage } from 'naive-ui'
import { getVideoBlobUrl, getVideoFile, revokeVideoBlobUrl, registerVideoFile } from '@/utils/videoFileManager'

interface Props {
  collection: VideoCollection
  initialEpisode?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialEpisode: 0
})

const emit = defineEmits<{
  'episode-change': [index: number]
}>()

const videoStore = useVideoStore()
const message = useMessage()

const playerRef = ref<HTMLVideoElement | null>(null)
const player = ref<Player | null>(null)
const autoPlayNext = ref(false)
const currentVideoIndex = ref(props.initialEpisode)
const videoFile = computed(() => props.collection.videos[currentVideoIndex.value])
const currentBlobUrl = ref<string | null>(null)
const videoUrl = ref<string | null>(null)

// 初始化播放器
const initPlayer = async () => {
  if (!playerRef.value || !videoFile.value) return

  // ????????????
  let file = getVideoFile(videoFile.value.id)
  let blobUrl: string | null = null

  if (file && file instanceof File && file.size > 0) {
    console.log('? Using local file:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)

    if (currentBlobUrl.value) {
      try {
        revokeVideoBlobUrl(currentBlobUrl.value)
      } catch (e) {
        console.warn('Error revoking blob URL:', e)
      }
      currentBlobUrl.value = null
    }

    try {
      blobUrl = URL.createObjectURL(file)
      currentBlobUrl.value = blobUrl
      console.log('? Created blob URL:', blobUrl.substring(0, 50) + '...')
    } catch (error) {
      console.error('? Failed to create blob URL:', error)
      message.error('????URL???' + (error as Error).message)
      return
    }
  } else {
    console.log('?? Local file not found, fetching from backend...')
    try {
      const playUrl = await videoStore.getVideoPlayUrl(videoFile.value.id)
      blobUrl = playUrl
      videoUrl.value = playUrl
      console.log('? Got play URL from backend:', playUrl.substring(0, 50) + '...')
    } catch (error) {
      console.error('? Failed to get play URL from backend:', error)
      message.error('?????????????????????????')
      return
    }
  }

  if (!blobUrl) {
    message.error('??????????')
    return
  }

  await nextTick()
  if (!playerRef.value || !document.body.contains(playerRef.value)) {
    console.warn('Player element not found in DOM')
    return
  }

  const source = {
    src: blobUrl,
    type: `video/${videoFile.value.format}`
  }

  if (player.value) {
    const shouldAutoPlay = autoPlayNext.value
    autoPlayNext.value = false

    try {
      if (shouldAutoPlay) {
        player.value.one('canplay', () => {
          player.value?.play().catch(() => {})
        })
      }
      player.value.src(source)
      player.value.load()
      return
    } catch (error) {
      console.warn('Error updating player source, re-create player:', error)
      try {
        player.value.dispose()
      } catch (disposeError) {
        console.warn('Error disposing player:', disposeError)
      }
      player.value = null
    }
  }

  try {
    console.log('?? Creating video player with URL:', blobUrl.substring(0, 50) + '...')

    player.value = videojs(playerRef.value, {
      controls: true,
      autoplay: autoPlayNext.value,
      preload: 'auto',
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      sources: [source],
      html5: {
        vhs: {
          overrideNative: false
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false
      }
    })

    player.value.ready(async () => {
      if (!player.value || !videoFile.value) return

      console.log('Player is ready')

      setupPlayerEvents()

      const record = await videoStore.getPlayRecord(videoFile.value.id)
      if (record && record.currentTime > 0) {
        player.value.on('loadedmetadata', () => {
          if (player.value && player.value.readyState() >= 1) {
            player.value.currentTime(record.currentTime)
            message.info(`???????????${formatTime(record.currentTime)}`)
          }
        }, { once: true })
      }

      if (autoPlayNext.value) {
        autoPlayNext.value = false
        player.value.play().catch(() => {})
      }
    })
  } catch (error) {
    console.error('Failed to initialize player:', error)
    message.error('?????????' + (error as Error).message)

    if (currentBlobUrl.value) {
      URL.revokeObjectURL(currentBlobUrl.value)
      currentBlobUrl.value = null
    }
  }
}

// 设置播放器事件监听
const setupPlayerEvents = () => {
  if (!player.value) return

  // 监听加载错误
  player.value.on('error', () => {
    const playerError = player.value?.error()
    console.error('❌ Player error:', playerError)
    if (playerError) {
      const errorMsg = playerError.message || playerError.code?.message || '未知错误'
      console.error('Error details:', {
        code: playerError.code,
        message: errorMsg,
        fileSize: videoFile.value?.size,
        fileName: videoFile.value?.name
      })
      message.error(`播放错误: ${errorMsg}`)
    }
  })
  
  // 监听加载开始
  player.value.on('loadstart', () => {
    console.log('📥 Video load started')
  })
  
  // 监听元数据加载
  player.value.on('loadedmetadata', () => {
    console.log('✅ Video metadata loaded, duration:', player.value?.duration())
  })
  
  // 监听加载数据
  player.value.on('loadeddata', () => {
    console.log('✅ Video data loaded')
  })
  
  // 监听可以播放
  player.value.on('canplay', () => {
    console.log('✅ Video can play')
  })

  // 监听播放进度，保存记录
  let saveTimer: number | null = null
  player.value.on('timeupdate', () => {
    if (saveTimer) return
    
    saveTimer = window.setTimeout(() => {
      savePlayRecord()
      saveTimer = null
    }, 5000) // 每5秒保存一次
  })

  // 监听播放结束，自动下一集
  player.value.on('ended', () => {
    const next = videoStore.getNextVideo()
    if (next) {
      autoPlayNext.value = true
      switchToEpisode(next.videoIndex)
      message.success('???????')
    } else {
      message.info('?????')
    }
  })
}


// 保存播放记录
const savePlayRecord = () => {
  if (!player.value || !videoFile.value) return

  const record: PlayRecord = {
    videoId: videoFile.value.id,
    collectionId: props.collection.id,
    episodeIndex: currentVideoIndex.value,
    currentTime: player.value.currentTime() || 0,
    duration: player.value.duration() || 0,
    lastPlayedAt: Date.now()
  }

  videoStore.savePlayRecord(record)
}

// 切换到指定集数
const switchToEpisode = (index: number) => {
  if (index < 0 || index >= props.collection.videos.length) return

  // 保存当前播放记录
  savePlayRecord()

  // 切换集数
  currentVideoIndex.value = index
  videoStore.setCurrentVideo(props.collection, index)
  emit('episode-change', index)

  // 更新播放器源（不重新创建播放器）
  initPlayer()
}

// 加载第一集
const loadFirstVideo = () => {
  if (props.collection.videos.length > 0) {
    switchToEpisode(0)
  }
}

// 格式化时间
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 监听视频文件变化
watch(videoFile, async (newVideo, oldVideo) => {
  // 只有在视频文件真正改变时才重新初始化
  if (newVideo && (!oldVideo || newVideo.id !== oldVideo.id)) {
    await nextTick()
    // 延迟一点确保DOM更新完成
    setTimeout(() => {
      initPlayer()
    }, 100)
  }
}, { immediate: false })

// 监听集数变化
watch(() => props.initialEpisode, async (newIndex) => {
  if (newIndex !== currentVideoIndex.value) {
    await nextTick()
    switchToEpisode(newIndex)
  }
})

onMounted(async () => {
  await nextTick()
  // 等待DOM完全渲染
  setTimeout(() => {
    if (videoFile.value && playerRef.value) {
      initPlayer()
    }
  }, 200)
})

onUnmounted(() => {
  // 保存播放记录
  savePlayRecord()
  
  // 释放Blob URL
  if (currentBlobUrl.value) {
    revokeVideoBlobUrl(currentBlobUrl.value)
    currentBlobUrl.value = null
  }
  
  // 销毁播放器（确保DOM元素存在）
  if (player.value) {
    try {
      // 移除所有事件监听器
      player.value.off()
      // 暂停播放
      if (!player.value.paused()) {
        player.value.pause()
      }
      // 销毁播放器
      player.value.dispose()
    } catch (error) {
      console.warn('Error disposing player:', error)
    }
    player.value = null
  }
})
</script>

<style scoped lang="scss">
.video-player-wrapper {
  width: 100%;
  position: relative;
}

.video-player-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

.player-placeholder {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

:deep(.video-js) {
  width: 100%;
  height: 100%;
}

:deep(.vjs-big-play-button) {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
