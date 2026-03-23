<template>
  <div class="admin-view">
    <n-card>
      <n-space vertical :size="16">
        <n-space justify="space-between" align="center" :wrap="true">
          <n-space align="center">
            <n-button type="primary" @click="() => loadTasks()">刷新</n-button>
            <n-switch v-model:value="autoRefresh" />
            <n-text depth="3">自动轮询（2 秒）</n-text>
          </n-space>
          <n-text depth="3">仅保留当前服务生命周期内的任务，服务重启后队列会清空。</n-text>
        </n-space>

        <n-data-table
          :columns="columns"
          :data="tasks"
          :loading="loading"
          :row-key="rowKey"
          :pagination="false"
          :scroll-x="1400"
        />
      </n-space>
    </n-card>

    <n-modal v-model:show="showDetail" preset="card" title="转换任务详情" style="width: 1100px">
      <n-space vertical :size="12">
        <n-descriptions bordered :column="2" label-placement="left" size="small">
          <n-descriptions-item label="任务 ID">{{ detail?.taskId || '-' }}</n-descriptions-item>
          <n-descriptions-item label="状态">{{ statusLabel(detail?.status) }}</n-descriptions-item>
          <n-descriptions-item label="目标类型">{{ targetTypeLabel(detail?.targetType) }}</n-descriptions-item>
          <n-descriptions-item label="输出模式">{{ outputModeLabel(detail?.outputMode) }}</n-descriptions-item>
          <n-descriptions-item label="创建时间">{{ formatTime(detail?.createTime) }}</n-descriptions-item>
          <n-descriptions-item label="进度">{{ formatProgress(detail?.totalProgress) }}</n-descriptions-item>
        </n-descriptions>

        <n-data-table
          :columns="detailColumns"
          :data="detail?.items || []"
          :pagination="false"
          :scroll-x="1200"
          size="small"
        />
      </n-space>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NProgress, NTag, useMessage } from 'naive-ui'
import { adminApi, type AdminTranscodeTaskDetail, type AdminTranscodeTaskItem, type AdminTranscodeTaskSummary } from '@/api/admin'
import { getErrorMessage } from '@/utils/error'

const message = useMessage()
const loading = ref(false)
const tasks = ref<AdminTranscodeTaskSummary[]>([])
const showDetail = ref(false)
const detail = ref<AdminTranscodeTaskDetail | null>(null)
const autoRefresh = ref(true)
let timer: number | null = null

const rowKey = (row: AdminTranscodeTaskSummary) => row.taskId ?? ''

const statusTagType = (status?: string) => {
  if (status === 'success') return 'success'
  if (status === 'partial_success') return 'warning'
  if (status === 'failed') return 'error'
  if (status === 'running') return 'info'
  return 'default'
}

const statusLabel = (status?: string) => {
  if (status === 'queued') return '排队中'
  if (status === 'running') return '执行中'
  if (status === 'success') return '成功'
  if (status === 'partial_success') return '部分成功'
  if (status === 'failed') return '失败'
  return '-'
}

const targetTypeLabel = (targetType?: string) => (targetType === 'collection' ? '合集' : targetType === 'video' ? '视频' : '-')
const outputModeLabel = (outputMode?: string) => (outputMode === 'switch_path_only' ? '保留源文件，仅切换路径' : outputMode === 'replace_original' ? '替换源文件' : '-')
const itemStatusLabel = (status?: string) => {
  if (status === 'queued') return '排队中'
  if (status === 'running') return '执行中'
  if (status === 'success') return '成功'
  if (status === 'skipped') return '跳过'
  if (status === 'failed') return '失败'
  return '-'
}
const formatProgress = (value?: number) => `${Number(value || 0).toFixed(2)}%`
const formatTime = (value?: string) => (value ? new Date(value).toLocaleString() : '-')

const columns = computed<DataTableColumns<AdminTranscodeTaskSummary>>(() => [
  { title: '任务 ID', key: 'taskId', width: 180, ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'createTime', width: 180, render: (row) => formatTime(row.createTime) },
  { title: '目标类型', key: 'targetType', width: 90, render: (row) => targetTypeLabel(row.targetType) },
  { title: '输出模式', key: 'outputMode', width: 220, ellipsis: { tooltip: true }, render: (row) => outputModeLabel(row.outputMode) },
  { title: '状态', key: 'status', width: 110, render: (row) => h(NTag, { type: statusTagType(row.status), size: 'small' }, { default: () => statusLabel(row.status) }) },
  { title: '总进度', key: 'totalProgress', width: 180, render: (row) => h(NProgress, { percentage: Number(row.totalProgress || 0), height: 10, showIndicator: true, processing: row.status === 'running' }) },
  { title: '当前文件', key: 'currentFile', minWidth: 260, ellipsis: { tooltip: true }, render: (row) => row.currentFile || '-' },
  { title: '结果统计', key: 'stats', width: 180, render: (row) => `${row.successCount || 0}/${row.failedCount || 0}/${row.skippedCount || 0}` },
  { title: '操作', key: 'actions', width: 100, render: (row) => h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => openDetail(row) }, { default: () => '详情' }) }
])

const detailColumns = computed<DataTableColumns<AdminTranscodeTaskItem>>(() => [
  { title: '#', key: 'index', width: 60 },
  { title: '源路径', key: 'sourcePath', minWidth: 320, ellipsis: { tooltip: true } },
  { title: '输出路径', key: 'outputPath', minWidth: 320, ellipsis: { tooltip: true }, render: (row) => row.outputPath || '-' },
  { title: '状态', key: 'status', width: 100, render: (row) => h(NTag, { type: statusTagType(row.status), size: 'small' }, { default: () => itemStatusLabel(row.status) }) },
  { title: '进度', key: 'progress', width: 160, render: (row) => h(NProgress, { percentage: Number(row.progress || 0), height: 10, showIndicator: true, processing: row.status === 'running' }) },
  { title: '结果', key: 'message', minWidth: 220, ellipsis: { tooltip: true }, render: (row) => row.message || '-' }
])

const loadTasks = async (silent = false) => {
  if (!silent) loading.value = true
  try {
    tasks.value = await adminApi.getTranscodeTasks()
    if (showDetail.value && detail.value?.taskId) {
      detail.value = await adminApi.getTranscodeTaskDetail(detail.value.taskId)
    }
  } catch (error) {
    if (!silent) {
      message.error(getErrorMessage(error))
    }
  } finally {
    loading.value = false
  }
}

const openDetail = async (task: AdminTranscodeTaskSummary) => {
  if (!task.taskId) return
  try {
    detail.value = await adminApi.getTranscodeTaskDetail(task.taskId)
    showDetail.value = true
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const startPolling = () => {
  stopPolling()
  timer = window.setInterval(() => {
    if (autoRefresh.value) {
      loadTasks(true)
    }
  }, 2000)
}

const stopPolling = () => {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  loadTasks()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style scoped lang="scss">
.admin-view {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
