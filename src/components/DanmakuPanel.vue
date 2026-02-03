<template>
  <div class="danmaku-panel">
    <n-space vertical :size="12">
      <n-space align="center">
        <n-input
          v-model:value="content"
          placeholder="发送一条弹幕..."
          maxlength="100"
          show-count
          clearable
        />
        <n-button type="primary" :disabled="!content.trim()" :loading="sending" @click="handleSend">
          发送
        </n-button>
      </n-space>

      <n-list v-if="danmakus.length">
        <n-list-item v-for="item in danmakus" :key="item.id">
          <n-thing>
            <template #header>
              <n-space align="center">
                <n-tag size="small" type="info">{{ formatTime(item.time || 0) }}</n-tag>
                <n-text>{{ item.content }}</n-text>
              </n-space>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>

      <n-empty v-else description="暂无弹幕" />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { danmakuApi, type Danmaku } from '@/api/danmaku'
import { getErrorMessage } from '@/utils/error'

interface Props {
  videoId: string
  getCurrentTime?: () => number
}

const props = defineProps<Props>()
const message = useMessage()

const content = ref('')
const sending = ref(false)
const danmakus = ref<Danmaku[]>([])

const loadDanmakus = async () => {
  if (!props.videoId) return
  try {
    danmakus.value = await danmakuApi.getDanmakus(props.videoId)
  } catch (error) {
    console.error('Failed to load danmakus:', error)
  }
}

const handleSend = async () => {
  if (!props.videoId || !content.value.trim()) return
  sending.value = true
  try {
    const time = props.getCurrentTime ? Math.floor(props.getCurrentTime()) : 0
    const result = await danmakuApi.addDanmaku({
      videoId: props.videoId,
      content: content.value.trim(),
      time
    })
    danmakus.value.unshift(result)
    content.value = ''
    message.success('弹幕发送成功')
  } catch (error) {
    console.error('Failed to send danmaku:', error)
    message.error(getErrorMessage(error))
  } finally {
    sending.value = false
  }
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

watch(() => props.videoId, () => {
  danmakus.value = []
  loadDanmakus()
}, { immediate: true })
</script>

<style scoped lang="scss">
.danmaku-panel {
  width: 100%;
}
</style>
