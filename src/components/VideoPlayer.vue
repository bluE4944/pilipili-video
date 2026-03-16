<template>

  <div class="video-player-wrapper">

    <div v-if="!videoFile" class="player-placeholder">

      <n-empty description="请选择要播放的视频">

        <template #extra>

          <n-button @click="loadFirstVideo">播放第一集</n-button>

        </template>

      </n-empty>

    </div>

    <div
      v-show="videoFile"
      class="video-player-container"
      ref="playerContainerRef"
      :style="{ '--video-brightness': String(brightness) }"
    >

      <video

        ref="playerRef"

        class="video-js vjs-big-play-centered"

        playsinline

      ></video>

    </div>

    <teleport v-if="playerOverlayTarget && danmakuEnabled" :to="playerOverlayTarget">
      <div class="danmaku-overlay" :class="{ 'is-paused': danmakuPaused }">
        <div
          v-for="item in activeDanmakus"
          :key="item.key"
          class="danmaku-item"
          :style="{
            top: `${item.top}px`,
            color: item.color || '#fff',
            fontSize: `${item.fontSize || 14}px`,
            '--danmaku-duration': `${item.duration}s`
          }"
        >
          {{ item.text }}
        </div>
      </div>
    </teleport>
    <div v-else-if="danmakuEnabled" class="danmaku-overlay" :class="{ 'is-paused': danmakuPaused }">
      <div
        v-for="item in activeDanmakus"
        :key="item.key"
        class="danmaku-item"
        :style="{
          top: `${item.top}px`,
          color: item.color || '#fff',
          fontSize: `${item.fontSize || 14}px`,
          '--danmaku-duration': `${item.duration}s`
        }"
      >
        {{ item.text }}
      </div>
    </div>

    <teleport v-if="playerOverlayTarget" :to="playerOverlayTarget">
      <transition name="key-hint">
        <div v-if="keyHint.visible" class="video-key-hint">
          <span class="video-key-hint-icon">{{ keyHint.icon }}</span>
          <span>{{ keyHint.text }}</span>
          <div v-if="keyHint.percent !== null" class="video-key-hint-bar">
            <div class="video-key-hint-bar-fill" :style="{ width: `${keyHint.percent}%` }"></div>
          </div>
        </div>
      </transition>
    </teleport>
    <transition v-else name="key-hint">
      <div v-if="keyHint.visible" class="video-key-hint">
        <span class="video-key-hint-icon">{{ keyHint.icon }}</span>
        <span>{{ keyHint.text }}</span>
        <div v-if="keyHint.percent !== null" class="video-key-hint-bar">
          <div class="video-key-hint-bar-fill" :style="{ width: `${keyHint.percent}%` }"></div>
        </div>
      </div>
    </transition>

  </div>

</template>



<script setup lang="ts">

import { ref, onMounted, onUnmounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'

import videojs from 'video.js'

import type Player from 'video.js/dist/types/player'

import type { VideoCollection, VideoFile, PlayRecord } from '@/types'

import { useVideoStore } from '@/store/video'
import { playRecordApi } from '@/api/video'

import { useMessage } from 'naive-ui'

import { getVideoBlobUrl, getVideoFile, revokeVideoBlobUrl, registerVideoFile } from '@/utils/videoFileManager'
import { getErrorMessage } from '@/utils/error'
import { danmakuApi, type Danmaku } from '@/api/danmaku'



interface Props {

  collection: VideoCollection

  initialEpisode?: number

}



const props = withDefaults(defineProps<Props>(), {

  initialEpisode: 0

})



const emit = defineEmits<{

  'episode-change': [index: number]
  'play-counted': [videoId: string, playCount?: number]

}>()



const videoStore = useVideoStore()

const message = useMessage()



const playerRef = ref<HTMLVideoElement | null>(null)
const playerContainerRef = ref<HTMLDivElement | null>(null)

const player = ref<Player | null>(null)

let resizeObserver: ResizeObserver | null = null
let resizeRaf = 0
let appliedPlayRecordKey: string | null = null
let pendingPlayRecordKey: string | null = null
let pendingPlayRecordAt = 0
let pendingPlayRecordTimer: number | null = null
let playCountReportedVideoId: string | null = null
let playCountReportingVideoId: string | null = null
let initSequence = 0
let danmakuTrackIndex = 0
const danmakuList = ref<Danmaku[]>([])
const danmakuCursor = ref(0)
const activeDanmakus = ref<Array<{
  key: string
  text: string
  top: number
  color?: string
  fontSize?: number
  duration: number
}>>([])
const danmakuPaused = ref(false)
const danmakuEnabled = ref(true)
const danmakuTrackCount = ref(4)
const danmakuTimers = new Map<string, number>()

const clearPendingPlayRecord = () => {
  pendingPlayRecordKey = null
  pendingPlayRecordAt = 0
  if (pendingPlayRecordTimer) {
    window.clearTimeout(pendingPlayRecordTimer)
    pendingPlayRecordTimer = null
  }
}

const updateDanmakuTracks = () => {
  const height = playerContainerRef.value?.clientHeight || 0
  const maxHeight = Math.max(0, Math.floor(height * 0.35))
  const lineHeight = 24
  const count = Math.max(2, Math.min(6, Math.floor(maxHeight / lineHeight)))
  danmakuTrackCount.value = count || 2
}

const clearActiveDanmakus = () => {
  activeDanmakus.value = []
  danmakuTimers.forEach((timer) => window.clearTimeout(timer))
  danmakuTimers.clear()
  danmakuTrackIndex = 0
}

const loadDanmakuList = async () => {
  if (!videoFile.value) {
    danmakuList.value = []
    danmakuCursor.value = 0
    clearActiveDanmakus()
    return
  }
  try {
    const list = await danmakuApi.getDanmakus(videoFile.value.id)
    danmakuList.value = (list || []).slice().sort((a, b) => (a.time || 0) - (b.time || 0))
    danmakuCursor.value = 0
    clearActiveDanmakus()
  } catch (error) {
    console.error('Failed to load danmaku list:', error)
    danmakuList.value = []
    danmakuCursor.value = 0
    clearActiveDanmakus()
  }
}

const spawnDanmaku = (item: Danmaku) => {
  const text = item.content || ''
  if (!text) return
  const trackCount = danmakuTrackCount.value || 2
  const trackIndex = danmakuTrackIndex % trackCount
  danmakuTrackIndex += 1
  const lineHeight = 24
  const top = 8 + trackIndex * lineHeight
  const duration = Math.min(12, Math.max(6, 8 + text.length * 0.15))
  const key = `${item.id}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
  activeDanmakus.value.push({
    key,
    text,
    top,
    color: item.color,
    fontSize: item.fontSize,
    duration
  })
  const timer = window.setTimeout(() => {
    activeDanmakus.value = activeDanmakus.value.filter((entry) => entry.key !== key)
    danmakuTimers.delete(key)
  }, duration * 1000)
  danmakuTimers.set(key, timer)
}

const updateDanmakuByTime = (time: number) => {
  if (!danmakuEnabled.value) return
  if (!danmakuList.value.length) return
  let cursor = danmakuCursor.value
  while (cursor < danmakuList.value.length) {
    const item = danmakuList.value[cursor]
    const itemTime = item.time || 0
    if (itemTime > time + 0.2) break
    spawnDanmaku(item)
    cursor += 1
  }
  danmakuCursor.value = cursor
}

const resetDanmakuCursor = (time: number) => {
  if (!danmakuList.value.length) return
  const target = Math.max(0, time - 0.5)
  const list = danmakuList.value
  let idx = 0
  while (idx < list.length && (list[idx].time || 0) < target) {
    idx += 1
  }
  danmakuCursor.value = idx
  clearActiveDanmakus()
}

const applyPlayRecordForCurrentVideo = async (forceWait = false) => {
  if (!player.value || !videoFile.value) return
  const record = await videoStore.getPlayRecord(videoFile.value.id)
  if (!record || record.currentTime <= 0) return
  const recordKey = `${videoFile.value.id}-${Math.round(record.currentTime)}`
  const now = Date.now()
  if (recordKey === appliedPlayRecordKey) return
  if (recordKey === pendingPlayRecordKey && now - pendingPlayRecordAt < 3000) return
  pendingPlayRecordKey = recordKey
  pendingPlayRecordAt = now
  if (pendingPlayRecordTimer) {
    window.clearTimeout(pendingPlayRecordTimer)
  }
  pendingPlayRecordTimer = window.setTimeout(() => {
    if (pendingPlayRecordKey === recordKey) {
      clearPendingPlayRecord()
    }
  }, 3500)
  let hasApplied = false
  const applySeek = () => {
    if (hasApplied) return
    hasApplied = true
    if (!player.value || !isPlayerUsable()) return
    const duration = player.value.duration() || 0
    const target = duration > 0 ? Math.min(record.currentTime, Math.max(duration - 0.5, 0)) : record.currentTime
    player.value.currentTime(target)
    const episodeLabel = props.collection.videos.length > 1 ? `第${currentVideoIndex.value + 1}集` : ''
    message.info(episodeLabel
      ? `已定位到上次播放（${episodeLabel}）：${formatTime(target)}`
      : `已定位到上次播放：${formatTime(target)}`)
    appliedPlayRecordKey = recordKey
    clearPendingPlayRecord()
  }
  if (forceWait) {
    safeOne('loadedmetadata', applySeek)
    safeOne('loadeddata', applySeek)
    window.setTimeout(() => {
      if (!hasApplied && player.value && isPlayerUsable()) {
        const current = player.value.currentTime() || 0
        if (current <= 0.1) {
          applySeek()
        }
      }
    }, 400)
    return
  }
  if (player.value.readyState() >= 1) {
    applySeek()
  } else {
    safeOne('loadedmetadata', applySeek)
  }
}

const requestPlayerResize = () => {
  if (resizeRaf) return
  resizeRaf = window.requestAnimationFrame(() => {
    resizeRaf = 0
    if (!player.value || !isPlayerUsable()) return
    const instance = player.value as any
    if (typeof instance.resize === 'function') {
      instance.resize()
    }
    if (typeof instance.trigger === 'function') {
      instance.trigger('resize')
      instance.trigger('playerresize')
    }
    updateDanmakuTracks()
  })
}

let destroyed = false

let initTimer: number | null = null

let mountTimer: number | null = null

const scheduleInitPlayer = (delay = 100) => {
  if (initTimer) {
    window.clearTimeout(initTimer)
    initTimer = null
  }
  if (mountTimer) {
    window.clearTimeout(mountTimer)
    mountTimer = null
  }
  initTimer = window.setTimeout(() => {
    if (!destroyed) {
      initPlayer()
    }
  }, delay)
}

const autoPlayNext = ref(false)

const currentVideoIndex = ref(props.initialEpisode)

const videoFile = computed(() => props.collection.videos[currentVideoIndex.value])

const currentBlobUrl = ref<string | null>(null)

const videoUrl = ref<string | null>(null)
const keyHint = ref<{ text: string; icon: string; visible: boolean; percent: number | null }>({
  text: '',
  icon: '',
  visible: false,
  percent: null
})
let keyHintTimer: number | null = null
const playerOverlayTarget = ref<HTMLElement | null>(null)
let manualOrientation: 'landscape' | 'portrait' | null = null
let orientationButtonRegistered = false
const ORIENTATION_BUTTON_NAME = 'OrientationButton'
let danmakuButtonRegistered = false
const DANMAKU_BUTTON_NAME = 'DanmakuToggleButton'

let longPressTimer: number | null = null
let longPressActive = false
let touchStartX = 0
let touchStartY = 0
let touchStartVideoTime = 0
let touchStartPlaybackRate = 1
let touchStartVolume = 1
let touchStartBrightness = 1
let touchStartSide: 'left' | 'right' | null = null
let lastTapTime = 0
let lastTapX = 0
let lastTapY = 0
let isSeeking = false
let isTouching = false
let isAdjustingVolume = false
let isAdjustingBrightness = false
let gestureMode: 'none' | 'seek' | 'volume' | 'brightness' = 'none'

const brightness = ref(1)

const isEditableTarget = (target: EventTarget | null) => {
  if (!target || !(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || target.isContentEditable
}

const togglePlay = () => {
  if (!player.value) return
  if (player.value.paused()) {
    player.value.play().catch(() => {})
  } else {
    player.value.pause()
  }
}

const seekBy = (delta: number) => {
  if (!player.value) return
  const current = player.value.currentTime() || 0
  const duration = player.value.duration() || 0
  const nextTime = duration > 0 ? Math.min(Math.max(current + delta, 0), duration) : Math.max(current + delta, 0)
  player.value.currentTime(nextTime)
}

const changeVolume = (delta: number) => {
  if (!player.value) return
  const current = player.value.volume() ?? 1
  const next = Math.min(Math.max(current + delta, 0), 1)
  player.value.volume(next)
}

const toggleMute = () => {
  if (!player.value) return
  player.value.muted(!player.value.muted())
}

const toggleFullscreen = () => {
  if (!player.value) return
  if (player.value.isFullscreen()) {
    player.value.exitFullscreen()
  } else {
    player.value.requestFullscreen()
  }
}

const showKeyHint = (text: string, icon = '▶', percent: number | null = null) => {
  keyHint.value = { text, icon, visible: true, percent }
  if (keyHintTimer) {
    window.clearTimeout(keyHintTimer)
  }
  keyHintTimer = window.setTimeout(() => {
    keyHint.value = { text: '', icon: '', visible: false, percent: null }
    keyHintTimer = null
  }, 1200)
}

const isMobileDevice = () => window.innerWidth <= 768

const getSuggestedOrientation = (): 'landscape' | 'portrait' => {
  const width = player.value?.videoWidth?.() || 0
  const height = player.value?.videoHeight?.() || 0
  if (width > height) return 'landscape'
  return 'portrait'
}

const lockScreenOrientation = async (mode: 'landscape' | 'portrait') => {
  const orientation = (screen as any)?.orientation
  if (!orientation?.lock) {
    showKeyHint('不支持锁定方向', '⛶')
    return false
  }
  try {
    await orientation.lock(mode)
    return true
  } catch (error) {
    showKeyHint('锁定方向失败', '⛶')
    return false
  }
}

const unlockScreenOrientation = () => {
  const orientation = (screen as any)?.orientation
  if (orientation?.unlock) {
    orientation.unlock()
  }
}

const applyAutoOrientation = async () => {
  if (!player.value || !player.value.isFullscreen() || !isMobileDevice()) return
  if (manualOrientation) return
  const mode = getSuggestedOrientation()
  const ok = await lockScreenOrientation(mode)
  if (ok) {
    showKeyHint(mode === 'landscape' ? '横屏' : '竖屏', '⛶')
  }
}

const toggleOrientation = async () => {
  if (!player.value?.isFullscreen()) {
    showKeyHint('请先全屏', '⛶')
    return
  }
  const orientationType = (screen as any)?.orientation?.type || ''
  const isLandscape = orientationType.includes('landscape')
  const target: 'landscape' | 'portrait' = isLandscape ? 'portrait' : 'landscape'
  manualOrientation = target
  const ok = await lockScreenOrientation(target)
  if (ok) {
    showKeyHint(target === 'landscape' ? '横屏' : '竖屏', '⛶')
  }
}

const updateDanmakuButtonAppearance = (button?: any) => {
  if (!player.value) return
  const controlBar = player.value.getChild('controlBar') as any
  const instance = button || controlBar?.getChild(DANMAKU_BUTTON_NAME)
  if (!instance) return
  const root = instance.el() as HTMLElement | null
  if (root) {
    const placeholder = root.querySelector('.vjs-icon-placeholder') as HTMLElement | null
    if (placeholder) {
      placeholder.style.display = ''
      placeholder.textContent = danmakuEnabled.value ? '💬' : '🚫'
    }
    const existing = root.querySelector('.danmaku-svg')
    if (existing) {
      existing.remove()
    }
  }
  if (danmakuEnabled.value) {
    instance.removeClass('vjs-danmaku-off')
  } else {
    instance.addClass('vjs-danmaku-off')
  }
}

const toggleDanmaku = () => {
  danmakuEnabled.value = !danmakuEnabled.value
  updateDanmakuButtonAppearance()
  showKeyHint(danmakuEnabled.value ? '弹幕已开启' : '弹幕已关闭', danmakuEnabled.value ? '💬' : '🚫')
}

const registerDanmakuButton = () => {
  if (danmakuButtonRegistered) return
  const Button = videojs.getComponent('Button') as any
  class DanmakuToggleButton extends Button {
    constructor(player: Player, options: any) {
      super(player, options)
      this.addClass('vjs-control')
      this.addClass('vjs-button')
      this.addClass('vjs-danmaku-button')
      this.controlText('弹幕开关')
      updateDanmakuButtonAppearance(this)
    }
    handleClick() {
      toggleDanmaku()
    }
  }
  videojs.registerComponent(DANMAKU_BUTTON_NAME, DanmakuToggleButton)
  danmakuButtonRegistered = true
}

const ensureDanmakuButton = () => {
  if (!player.value) return
  registerDanmakuButton()
  const controlBar = player.value.getChild('controlBar') as any
  if (!controlBar || controlBar.getChild(DANMAKU_BUTTON_NAME)) return
  const progressControl = controlBar.getChild('progressControl')
  if (progressControl) {
    const index = controlBar.children().indexOf(progressControl)
    controlBar.addChild(DANMAKU_BUTTON_NAME, {}, index + 1)
  } else {
    controlBar.addChild(DANMAKU_BUTTON_NAME)
  }
}

const registerOrientationButton = () => {
  if (orientationButtonRegistered) return
  const Button = videojs.getComponent('Button') as any
  class OrientationButton extends Button {
    constructor(player: Player, options: any) {
      super(player, options)
      this.addClass('vjs-control')
      this.addClass('vjs-button')
      this.addClass('vjs-orientation-button')
      this.addClass('vjs-hidden')
      this.controlText('横竖屏')
      const icon = this.el()?.querySelector('.vjs-icon-placeholder')
      if (icon) {
        icon.textContent = '⛶'
      }
    }
    handleClick() {
      toggleOrientation()
    }
  }
  videojs.registerComponent(ORIENTATION_BUTTON_NAME, OrientationButton)
  orientationButtonRegistered = true
}

const ensureOrientationButton = () => {
  if (!player.value) return
  registerOrientationButton()
  const controlBar = player.value.getChild('controlBar') as any
  if (!controlBar || controlBar.getChild(ORIENTATION_BUTTON_NAME)) return
  const progressControl = controlBar.getChild('progressControl')
  const danmakuButton = controlBar.getChild(DANMAKU_BUTTON_NAME)
  if (progressControl) {
    let index = controlBar.children().indexOf(progressControl)
    if (danmakuButton) {
      const danIndex = controlBar.children().indexOf(danmakuButton)
      if (danIndex > index) {
        index = danIndex
      }
    }
    controlBar.addChild(ORIENTATION_BUTTON_NAME, {}, index + 1)
  } else {
    controlBar.addChild(ORIENTATION_BUTTON_NAME)
  }
  updateOrientationButtonVisibility()
}

const updateOrientationButtonVisibility = () => {
  if (!player.value) return
  const controlBar = player.value.getChild('controlBar') as any
  const button = controlBar?.getChild(ORIENTATION_BUTTON_NAME) as any
  if (!button) return
  const shouldShow = isMobileDevice() && player.value.isFullscreen()
  if (shouldShow) {
    button.removeClass('vjs-hidden')
  } else {
    button.addClass('vjs-hidden')
  }
}

const handleTouchStart = (event: TouchEvent) => {
  if (destroyed || !isPlayerUsable() || !videoFile.value) return
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  isTouching = true
  isSeeking = false
  isAdjustingVolume = false
  isAdjustingBrightness = false
  gestureMode = 'none'
  longPressActive = false
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchStartVideoTime = player.value?.currentTime() || 0
  touchStartVolume = player.value?.volume() ?? 1
  touchStartBrightness = brightness.value
  const containerWidth = playerContainerRef.value?.clientWidth || 0
  touchStartSide = containerWidth > 0 && touch.clientX > containerWidth / 2 ? 'right' : 'left'

  if (longPressTimer) {
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }
  longPressTimer = window.setTimeout(() => {
    if (!isTouching || isSeeking || !player.value) return
    if (!player.value.isFullscreen()) return
    longPressActive = true
    touchStartPlaybackRate = player.value.playbackRate()
    player.value.playbackRate(3)
    showKeyHint('3倍速', '⏩')
  }, 450)
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isTouching || !player.value || !videoFile.value) return
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY

  if (!isSeeking && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
    if (longPressTimer) {
      window.clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  if (gestureMode === 'none') {
    if (Math.abs(deltaX) > Math.abs(deltaY) + 6) {
      gestureMode = 'seek'
      isSeeking = true
    } else if (Math.abs(deltaY) > Math.abs(deltaX) + 6) {
      gestureMode = touchStartSide === 'right' ? 'volume' : 'brightness'
      isAdjustingVolume = gestureMode === 'volume'
      isAdjustingBrightness = gestureMode === 'brightness'
    }
  }

  if (gestureMode === 'volume' || gestureMode === 'brightness') {
    const containerHeight = playerContainerRef.value?.clientHeight || 1
    const ratio = deltaY / containerHeight
    event.preventDefault()
    if (gestureMode === 'volume') {
      const nextVolume = Math.min(Math.max(touchStartVolume - ratio, 0), 1)
      player.value.volume(nextVolume)
      showKeyHint(`音量 ${Math.round(nextVolume * 100)}%`, '🔊', Math.round(nextVolume * 100))
    } else {
      const nextBrightness = Math.min(Math.max(touchStartBrightness - ratio, 0.4), 1.6)
      brightness.value = Number(nextBrightness.toFixed(2))
      showKeyHint(`亮度 ${Math.round(brightness.value * 100)}%`, '☀', Math.round(brightness.value * 100))
    }
    return
  }

  if (gestureMode === 'seek' && isSeeking) {
    event.preventDefault()
    const duration = player.value.duration() || 0
    if (duration <= 0) return
    const containerWidth = playerContainerRef.value?.clientWidth || 1
    const deltaSeconds = (deltaX / containerWidth) * duration
    const nextTime = Math.min(Math.max(touchStartVideoTime + deltaSeconds, 0), duration)
    player.value.currentTime(nextTime)
    const icon = deltaSeconds >= 0 ? '⏩' : '⏪'
    showKeyHint(`进度 ${formatTime(nextTime)} / ${formatTime(duration)}`, icon)
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  if (!isTouching) return
  isTouching = false

  if (longPressTimer) {
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }

  if (longPressActive && player.value) {
    player.value.playbackRate(touchStartPlaybackRate || 1)
    showKeyHint('恢复原速', '▶')
    longPressActive = false
    return
  }

  if (isSeeking || isAdjustingVolume || isAdjustingBrightness) {
    isSeeking = false
    isAdjustingVolume = false
    isAdjustingBrightness = false
    gestureMode = 'none'
    return
  }

  const touch = event.changedTouches[0]
  if (!touch) return
  const now = Date.now()
  const dx = Math.abs(touch.clientX - lastTapX)
  const dy = Math.abs(touch.clientY - lastTapY)
  const isDoubleTap = now - lastTapTime < 300 && dx < 20 && dy < 20

  if (isDoubleTap) {
    togglePlay()
    showKeyHint(player.value?.paused() ? '暂停' : '播放', player.value?.paused() ? '⏸' : '▶')
    lastTapTime = 0
    return
  }

  lastTapTime = now
  lastTapX = touch.clientX
  lastTapY = touch.clientY
}

const handleTouchCancel = () => {
  if (longPressTimer) {
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }
  if (longPressActive && player.value) {
    player.value.playbackRate(touchStartPlaybackRate || 1)
    showKeyHint('恢复原速', '▶')
  }
  longPressActive = false
  isSeeking = false
  isAdjustingVolume = false
  isAdjustingBrightness = false
  gestureMode = 'none'
  isTouching = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (destroyed || !isPlayerUsable() || !videoFile.value) return
  if (isEditableTarget(event.target)) return
  if (event.ctrlKey || event.metaKey || event.altKey) return

  switch (event.key) {
    case ' ':
    case 'k':
    case 'K':
      event.preventDefault()
      togglePlay()
      showKeyHint(player.value?.paused() ? '暂停' : '播放', player.value?.paused() ? '⏸' : '▶')
      break
    case 'ArrowLeft':
      event.preventDefault()
      seekBy(-5)
      showKeyHint('快退 5 秒', '⏪')
      break
    case 'ArrowRight':
      event.preventDefault()
      seekBy(5)
      showKeyHint('快进 5 秒', '⏩')
      break
    case 'ArrowUp':
      event.preventDefault()
      changeVolume(0.05)
      showKeyHint(`音量 ${(Math.round((player.value?.volume() ?? 1) * 100))}%`, '🔊', Math.round((player.value?.volume() ?? 1) * 100))
      break
    case 'ArrowDown':
      event.preventDefault()
      changeVolume(-0.05)
      showKeyHint(`音量 ${(Math.round((player.value?.volume() ?? 1) * 100))}%`, '🔉', Math.round((player.value?.volume() ?? 1) * 100))
      break
    case 'm':
    case 'M':
      event.preventDefault()
      toggleMute()
      showKeyHint(player.value?.muted() ? '静音' : '取消静音', player.value?.muted() ? '🔇' : '🔊')
      break
    case 'f':
    case 'F':
      event.preventDefault()
      toggleFullscreen()
      showKeyHint(player.value?.isFullscreen() ? '进入全屏' : '退出全屏', '⛶')
      break
    case 'n':
    case 'N': {
      const next = videoStore.getNextVideo()
      if (next) {
        event.preventDefault()
        switchToEpisode(next.videoIndex)
        showKeyHint('下一集', '⏭')
      }
      break
    }
    case 'p':
    case 'P': {
      event.preventDefault()
      const prevIndex = currentVideoIndex.value - 1
      if (prevIndex >= 0) {
        switchToEpisode(prevIndex)
        showKeyHint('上一集', '⏮')
      }
      break
    }
    default:
      break
  }
}



const getCurrentTime = () => {

  return player.value?.currentTime() || 0

}

const resolveSourceExt = (format?: string, url?: string) => {
  const cleaned = (format || '').replace('.', '').toLowerCase()
  let ext = cleaned
  if (!ext && url) {
    const pureUrl = url.split('?')[0].split('#')[0]
    const parts = pureUrl.split('.')
    ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }
  return ext
}

const resolveSourceType = (format?: string, url?: string) => {
  const ext = resolveSourceExt(format, url)
  switch (ext) {
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    case 'ogg':
    case 'ogv':
      return 'video/ogg'
    case 'mov':
      return 'video/quicktime'
    case 'm3u8':
      return 'application/x-mpegURL'
    default:
      return undefined
  }
}



defineExpose({

  getCurrentTime

})


const isPlayerUsable = () => {

  if (!player.value || !playerRef.value) return false

  const instance = player.value as any

  if (typeof instance.isDisposed === 'function' && instance.isDisposed()) return false

  return document.body.contains(playerRef.value)

}

const stopUserActivity = () => {
  if (!player.value) return
  try {
    player.value.userActive(false)
  } catch (error) {
    console.warn('Error disabling user activity:', error)
  }
  try {
    player.value.off('useractive')
    player.value.off('userinactive')
  } catch (error) {
    console.warn('Error removing user activity events:', error)
  }
  try {
    const tech = (player.value as any).tech?.(true)
    if (tech?.off) tech.off()
  } catch (error) {
    console.warn('Error cleaning tech events:', error)
  }
}

const disposePlayer = () => {
  if (!player.value) return
  try {
    const instance = player.value as any
    if (instance?.activityCheckInterval) {
      window.clearInterval(instance.activityCheckInterval)
      instance.activityCheckInterval = null
    }
    if (instance?.inactivityTimeout) {
      window.clearTimeout(instance.inactivityTimeout)
      instance.inactivityTimeout = null
    }
    stopUserActivity()
    player.value.off()
    if (!player.value.paused()) {
      player.value.pause()
    }
  } catch (error) {
    console.warn('Error cleaning up player events:', error)
  }
  try {
    player.value.dispose()
  } catch (error) {
    console.warn('Error disposing player:', error)
  }
  player.value = null
}

const safeOne = (eventName: string, handler: () => void) => {
  if (!player.value || !isPlayerUsable()) return
  try {
    player.value.one(eventName, handler)
  } catch (error) {
    console.warn('Failed to bind player event:', eventName, error)
  }
}



// 初始化播放器

const initPlayer = async () => {

  if (destroyed || !playerRef.value || !videoFile.value) return
  const initId = ++initSequence
  appliedPlayRecordKey = null
  clearPendingPlayRecord()



  // 播放地址为空已播放完毕

  let file = getVideoFile(videoFile.value.id)

  let blobUrl: string | null = null



  if (file && file instanceof File && file.size > 0) {

    console.log('Using local file:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)


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

      console.log('Created blob URL:', blobUrl.substring(0, 50) + '...')
    } catch (error) {

      console.error('Failed to create blob URL:', error)
      message.error(`生成本地播放地址失败：${getErrorMessage(error)}`)

      return

    }

  } else {

    console.log('Local file not found, fetching from backend...')
    try {

      const playUrl = await videoStore.getVideoPlayUrl(videoFile.value.id)
      if (destroyed || initId !== initSequence) return

      blobUrl = playUrl

      videoUrl.value = playUrl

      console.log('Got play URL from backend:', playUrl.substring(0, 50) + '...')
    } catch (error) {

      console.error('Failed to get play URL from backend:', error)
      message.error(getErrorMessage(error))

      return

    }

  }



  if (!blobUrl) {

    message.error('播放地址为空')

    return

  }



  await nextTick()
  if (destroyed || initId !== initSequence) return

  if (!playerRef.value || !document.body.contains(playerRef.value)) {

    console.warn('Player element not found in DOM')

    return

  }



  const sourceExt = resolveSourceExt(videoFile.value?.format, blobUrl)
  if (['rm', 'rmvb', 'flv', 'avi', 'wmv'].includes(sourceExt)) {
    message.error(`当前格式 ${sourceExt.toUpperCase()} 暂不支持，请转码为 MP4/WebM`)
    return
  }
  const sourceType = resolveSourceType(videoFile.value?.format, blobUrl)
  const source = {

    src: blobUrl,

    ...(sourceType ? { type: sourceType } : {})

  }



  if (player.value) {

    const shouldAutoPlay = autoPlayNext.value

    autoPlayNext.value = false



    try {

      if (!isPlayerUsable()) {

        try {

          player.value.dispose()

        } catch (disposeError) {

          console.warn('Error disposing player:', disposeError)

        }

        player.value = null

      } else {

        if (shouldAutoPlay) {
          safeOne('canplay', () => {
            if (!destroyed && player.value && isPlayerUsable()) {
              player.value.play().catch(() => {})
            }
          })
        }

        if (destroyed || initId !== initSequence) return
        player.value.src(source)

        player.value.load()
        if (destroyed || initId !== initSequence) return
        applyPlayRecordForCurrentVideo(true)

        return

      }

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

    console.log('Creating video player with URL:', blobUrl.substring(0, 50) + '...')

    if (destroyed || initId !== initSequence) return
    player.value = videojs(playerRef.value, {

      controls: true,

      autoplay: autoPlayNext.value,

      preload: 'auto',

      fluid: true,
      aspectRatio: '16:9',
      responsive: true,

      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4],

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

      if (destroyed || !player.value || !videoFile.value || initId !== initSequence) return

      const instance = player.value as any

      if (typeof instance.isDisposed === 'function' && instance.isDisposed()) return



      console.log('Player is ready')



      playerOverlayTarget.value = player.value?.el() || null
      setupPlayerEvents()
      requestPlayerResize()
      window.setTimeout(requestPlayerResize, 50)



      await applyPlayRecordForCurrentVideo(true)



      if (autoPlayNext.value) {

        autoPlayNext.value = false

        player.value.play().catch(() => {})

      }

    })

  } catch (error) {

    console.error('Failed to initialize player:', error)

    message.error(`初始化播放器失败：${getErrorMessage(error)}`)



    if (currentBlobUrl.value) {

      URL.revokeObjectURL(currentBlobUrl.value)

      currentBlobUrl.value = null

    }

  }

}



// 设置播放器事件监听
const setupPlayerEvents = () => {
  if (!player.value || !isPlayerUsable()) return



  // 监听加载错误

  player.value.on('error', () => {

    const playerError = player.value?.error()

    console.error('播放器错误:', playerError)
    clearPendingPlayRecord()
    if (playerError) {

      const errorMsg = playerError.message || playerError.code?.message || '未知错误'

      console.error('Error details:', {
        code: playerError.code,
        message: errorMsg,
        fileSize: videoFile.value?.size,
        fileName: videoFile.value?.name,
        fileFormat: videoFile.value?.format,
        fileExt: resolveSourceExt(videoFile.value?.format, player.value?.currentSrc?.()),
        currentSrc: player.value?.currentSrc?.(),
        currentType: player.value?.currentType?.()
      })

      message.error(`播放错误：${errorMsg}`)

    }

  })

  

  // 监听加载开始
  player.value.on('loadstart', () => {
    console.log('Video load started')
    clearPendingPlayRecord()
    danmakuPaused.value = false
  })

  // 监听元数据加载完成
  player.value.on('loadedmetadata', () => {
    console.log('Video metadata loaded, duration:', player.value?.duration())
    requestPlayerResize()
    window.setTimeout(requestPlayerResize, 50)
    if (player.value?.isFullscreen()) {
      applyAutoOrientation()
    }
    updateDanmakuTracks()
  })
  

  // 监听加载数据

  player.value.on('loadeddata', () => {
    console.log('Video data loaded')
    requestPlayerResize()
  })
  

  // 监听可以播放

  player.value.on('canplay', () => {
    console.log('Video can play')
    requestPlayerResize()
  })

  player.value.on('play', () => {
    danmakuPaused.value = false
    reportPlayCountOnce()
  })

  player.value.on('pause', () => {
    danmakuPaused.value = true
  })

  player.value.on('seeked', () => {
    const current = player.value?.currentTime() || 0
    resetDanmakuCursor(current)
  })


  // 监听播放进度，保存记录
  let saveTimer: number | null = null
  player.value.on('timeupdate', () => {
    const current = player.value?.currentTime() || 0
    updateDanmakuByTime(current)

    if (saveTimer) return

    saveTimer = window.setTimeout(() => {
      savePlayRecord()
      saveTimer = null
    }, 5000) // 5 秒保存一次
  })

  // 监听播放结束，自动播放下一集
  player.value.on('ended', () => {
    const next = videoStore.getNextVideo()

    if (next) {

      autoPlayNext.value = true

      switchToEpisode(next.videoIndex)

      message.success('自动播放下一集')

    } else {

      message.info('已播放完毕')

    }

  })

  // 全屏变化时自动匹配横竖屏
  player.value.on('fullscreenchange', () => {
    if (!player.value) return
    if (player.value.isFullscreen()) {
      manualOrientation = null
      applyAutoOrientation()
    } else {
      manualOrientation = null
      unlockScreenOrientation()
    }
    updateOrientationButtonVisibility()
  })

  ensureDanmakuButton()
  updateDanmakuButtonAppearance()
  ensureOrientationButton()
  updateOrientationButtonVisibility()

}





// 上报播放量（每个视频仅一次）
const reportPlayCountOnce = async () => {
  if (!videoFile.value) return
  const videoId = String(videoFile.value.id || '')
  if (!videoId) return
  if (playCountReportedVideoId === videoId || playCountReportingVideoId === videoId) return
  playCountReportingVideoId = videoId
  try {
    const nextCount = await playRecordApi.incrementPlayCount(videoId)
    playCountReportedVideoId = videoId
    playCountReportingVideoId = null
    emit('play-counted', videoId, nextCount)
  } catch (error) {
    console.warn('Failed to increment play count:', error)
    playCountReportingVideoId = null
  }
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

    lastPlayedAt: Date.now(),

    playbackRate: player.value.playbackRate()

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
  scheduleInitPlayer(0)

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
    playCountReportedVideoId = null
    playCountReportingVideoId = null

    await nextTick()
    // 延迟一点确保DOM更新完成
    scheduleInitPlayer(100)

  }

}, { immediate: false })

watch(videoFile, () => {
  loadDanmakuList()
}, { immediate: true })

watch(danmakuEnabled, (enabled) => {
  updateDanmakuButtonAppearance()
  if (!enabled) {
    clearActiveDanmakus()
  } else {
    const current = player.value?.currentTime?.() || 0
    resetDanmakuCursor(current)
  }
})



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

  if (mountTimer) {

    clearTimeout(mountTimer)

  }

  scheduleInitPlayer(200)

  window.addEventListener('keydown', handleKeydown)
  if (playerContainerRef.value) {
    playerContainerRef.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    playerContainerRef.value.addEventListener('touchmove', handleTouchMove, { passive: false })
    playerContainerRef.value.addEventListener('touchend', handleTouchEnd, { passive: true })
    playerContainerRef.value.addEventListener('touchcancel', handleTouchCancel, { passive: true })
  }
  if (playerContainerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      requestPlayerResize()
    })
    resizeObserver.observe(playerContainerRef.value)
  }
})





onBeforeUnmount(() => {

  destroyed = true
  if (keyHintTimer) {
    window.clearTimeout(keyHintTimer)
    keyHintTimer = null
  }
  if (longPressTimer) {
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }
  if (playerContainerRef.value) {
    playerContainerRef.value.removeEventListener('touchstart', handleTouchStart)
    playerContainerRef.value.removeEventListener('touchmove', handleTouchMove)
    playerContainerRef.value.removeEventListener('touchend', handleTouchEnd)
    playerContainerRef.value.removeEventListener('touchcancel', handleTouchCancel)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (resizeRaf) {
    window.cancelAnimationFrame(resizeRaf)
    resizeRaf = 0
  }
  clearActiveDanmakus()
  clearPendingPlayRecord()
  window.removeEventListener('keydown', handleKeydown)

  if (initTimer) {

    clearTimeout(initTimer)

    initTimer = null

  }

  if (mountTimer) {

    clearTimeout(mountTimer)

    mountTimer = null

  }


  // ??????

  savePlayRecord()

  
  // ??Blob URL

  if (currentBlobUrl.value) {

    revokeVideoBlobUrl(currentBlobUrl.value)

    currentBlobUrl.value = null

  }

  
  disposePlayer()

})

onUnmounted(() => {

  destroyed = true

  disposePlayer()
  window.removeEventListener('keydown', handleKeydown)
  if (keyHintTimer) {
    window.clearTimeout(keyHintTimer)
    keyHintTimer = null
  }
  if (longPressTimer) {
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }
  if (playerContainerRef.value) {
    playerContainerRef.value.removeEventListener('touchstart', handleTouchStart)
    playerContainerRef.value.removeEventListener('touchmove', handleTouchMove)
    playerContainerRef.value.removeEventListener('touchend', handleTouchEnd)
    playerContainerRef.value.removeEventListener('touchcancel', handleTouchCancel)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (resizeRaf) {
    window.cancelAnimationFrame(resizeRaf)
    resizeRaf = 0
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

  padding: 0;
  margin: 0;
}

.video-key-hint {
  position: absolute;
  right: 16px;
  bottom: 40px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  border-radius: 8px;
  pointer-events: none;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(6px);
  flex-wrap: wrap;
}

.video-key-hint-icon {
  font-size: 14px;
  line-height: 1;
}

.video-key-hint-bar {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  overflow: hidden;
}

.video-key-hint-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a1d6 0%, #4fc3f7 100%);
}

.danmaku-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}

.danmaku-item {
  position: absolute;
  right: -10%;
  white-space: nowrap;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  animation: danmaku-move var(--danmaku-duration, 8s) linear;
  padding: 2px 4px;
}

.danmaku-overlay.is-paused .danmaku-item {
  animation-play-state: paused;
}

@keyframes danmaku-move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100vw - 100%));
  }
}

.key-hint-enter-active,
.key-hint-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.key-hint-enter-from,
.key-hint-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

::deep(.video-js .vjs-progress-control) {
  height: 8px;
}

::deep(.video-js .vjs-progress-holder) {
  height: 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
}

::deep(.video-js .vjs-load-progress) {
  background: rgba(255, 255, 255, 0.28);
  border-radius: 999px;
}

::deep(.video-js .vjs-play-progress) {
  background: linear-gradient(90deg, #00a1d6 0%, #4fc3f7 100%);
  border-radius: 999px;
}

::deep(.video-js .vjs-play-progress:before) {
  top: -5px;
  font-size: 0.9em;
}

::deep(.video-js .vjs-control-bar .vjs-button) {
  font-size: 14px;
}

::deep(.video-js .vjs-control-bar .vjs-icon-placeholder) {
  font-size: 14px;
  line-height: 1;
}

::deep(.video-js .vjs-orientation-button) {
  width: 40px;
  height: 32px;
}

::deep(.video-js .vjs-orientation-button .vjs-icon-placeholder) {
  font-family: inherit;
  font-size: 24px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

::deep(.video-js .vjs-danmaku-button) {
  width: 40px;
  height: 32px;
}

::deep(.video-js .vjs-danmaku-button .vjs-icon-placeholder) {
  font-size: 18px;
  line-height: 1;
}

::deep(.video-js .vjs-danmaku-button.vjs-danmaku-off .vjs-icon-placeholder) {
  opacity: 0.5;
}

::deep(.video-js .vjs-big-play-button) {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  right: auto !important;
  bottom: auto !important;
  margin: 0 !important;
  transform: translate(-50%, -50%) !important;
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

  position: relative;
  background: #000;

}

:deep(.vjs-tech) {
  filter: brightness(var(--video-brightness, 1));
}




:deep(.vjs-big-play-button) {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  right: auto !important;
  bottom: auto !important;
  margin: 0 !important;
  transform: translate(-50%, -50%) !important;
}

</style>









