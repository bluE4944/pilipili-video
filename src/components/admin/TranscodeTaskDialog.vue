<template>
  <n-modal :show="show" preset="dialog" :title="dialogTitle" @update:show="handleShowChange">
    <n-space vertical :size="16">
      <n-alert type="info" :show-icon="false">
        仅处理 MKV 且视频可直接 copy、只需修复音频兼容性的文件。
      </n-alert>

      <n-radio-group v-model:value="selectedMode">
        <n-space vertical :size="12">
          <div class="mode-card" :class="{ active: selectedMode === 'replace_original' }" @click="selectedMode = 'replace_original'">
            <n-radio value="replace_original">替换源文件</n-radio>
            <p>生成 MP4 后删除原 MKV，并将数据库路径切换到 MP4。</p>
          </div>
          <div class="mode-card" :class="{ active: selectedMode === 'switch_path_only' }" @click="selectedMode = 'switch_path_only'">
            <n-radio value="switch_path_only">保留源文件，仅切换路径</n-radio>
            <p>保留原 MKV，在同目录生成 MP4，并将数据库路径切换到 MP4。</p>
          </div>
        </n-space>
      </n-radio-group>
    </n-space>

    <template #action>
      <n-space>
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">创建任务</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AdminTranscodeOutputMode, AdminTranscodeTargetType } from '@/api/admin'

const props = withDefaults(defineProps<{
  show: boolean
  targetCount: number
  targetType: AdminTranscodeTargetType
  submitting?: boolean
}>(), {
  submitting: false
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'submit', payload: { outputMode: AdminTranscodeOutputMode }): void
}>()

const selectedMode = ref<AdminTranscodeOutputMode>('replace_original')

watch(
  () => props.show,
  (value) => {
    if (value) {
      selectedMode.value = 'replace_original'
    }
  }
)

const dialogTitle = computed(() => {
  const targetLabel = props.targetType === 'collection' ? '合集' : '视频'
  return `批量转 MP4（已选 ${props.targetCount} 个${targetLabel}）`
})

const handleShowChange = (value: boolean) => {
  emit('update:show', value)
}

const handleCancel = () => {
  emit('update:show', false)
}

const handleSubmit = () => {
  emit('submit', { outputMode: selectedMode.value })
}
</script>

<style scoped lang="scss">
.mode-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  p {
    margin: 8px 0 0 24px;
    color: rgba(0, 0, 0, 0.62);
    line-height: 1.6;
    font-size: 13px;
  }

  &:hover {
    border-color: rgba(24, 160, 88, 0.35);
    box-shadow: 0 10px 24px rgba(24, 160, 88, 0.08);
    transform: translateY(-1px);
  }

  &.active {
    border-color: #18a058;
    background: rgba(24, 160, 88, 0.06);
    box-shadow: 0 12px 28px rgba(24, 160, 88, 0.12);
  }
}
</style>
