<template>
  <div class="admin-view">
    <n-space vertical :size="16">
      <n-grid cols="1 s:2 m:4" responsive="screen" :x-gap="16" :y-gap="16">
        <n-grid-item>
          <n-card size="small" title="下载器状态">
            <n-space vertical :size="6">
              <n-tag :type="status.connected ? 'success' : 'error'" size="small">
                {{ status.connected ? '已连接' : '未连接' }}
              </n-tag>
              <n-text depth="3">{{ status.message || '-' }}</n-text>
            </n-space>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small" title="qB 版本">
            <n-text>{{ status.version || '-' }}</n-text>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small" title="默认保存目录">
            <n-text>{{ status.defaultSavePath || '跟随所选目录' }}</n-text>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small" title="最后探测时间">
            <n-text>{{ formatTime(status.lastCheckedAt) }}</n-text>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-card title="新增下载任务">
        <n-space vertical :size="16">
          <n-grid cols="1 m:3" responsive="screen" :x-gap="16" :y-gap="12">
            <n-grid-item>
              <n-form-item label="入库目录">
                <n-select
                  v-model:value="selectedFolderId"
                  :options="folderOptions"
                  placeholder="请选择已启用的本地文件夹"
                />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="添加后暂停">
                <n-switch v-model:value="addPaused" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="默认分类">
                <n-text>{{ status.defaultCategory || 'pilipili' }}</n-text>
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid cols="1 m:2" responsive="screen" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-card size="small" title="磁力链接">
                <n-space vertical :size="12">
                  <n-input
                    v-model:value="magnetUrl"
                    type="textarea"
                    :autosize="{ minRows: 4, maxRows: 6 }"
                    placeholder="输入 magnet:?xt=urn:btih:... 链接"
                  />
                  <n-button type="primary" :loading="creatingMagnet" @click="handleCreateMagnet">
                    提交磁力任务
                  </n-button>
                </n-space>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card size="small" title="种子文件">
                <n-space vertical :size="12">
                  <n-input :value="selectedTorrentFile?.name || ''" readonly placeholder="请选择 .torrent 文件" />
                  <n-space>
                    <n-button @click="triggerTorrentPicker">选择种子文件</n-button>
                    <n-button type="primary" :loading="creatingTorrent" :disabled="!selectedTorrentFile" @click="handleCreateTorrent">
                      上传并创建任务
                    </n-button>
                  </n-space>
                  <input
                    ref="torrentInputRef"
                    class="hidden-input"
                    type="file"
                    accept=".torrent,application/x-bittorrent"
                    @change="handleTorrentFileChange"
                  />
                </n-space>
              </n-card>
            </n-grid-item>
          </n-grid>
        </n-space>
      </n-card>

      <n-card>
        <n-space vertical :size="16">
          <n-space justify="space-between" align="center" :wrap="true">
            <n-space align="center">
              <n-button type="primary" @click="() => loadOverview()">刷新</n-button>
              <n-switch v-model:value="autoRefresh" />
              <n-text depth="3">自动轮询（2 秒）</n-text>
            </n-space>
            <n-text depth="3">下载完成后会自动触发所选目录的扫描入库。</n-text>
          </n-space>

          <n-data-table
            :columns="columns"
            :data="tasks"
            :loading="loading"
            :row-key="rowKey"
            :pagination="false"
            :scroll-x="1700"
          />
        </n-space>
      </n-card>
    </n-space>

    <n-modal v-model:show="showDetail" preset="card" title="下载任务详情" style="width: 980px">
      <n-space vertical :size="12">
        <n-descriptions bordered :column="2" label-placement="left" size="small">
          <n-descriptions-item label="任务 ID">{{ detail?.taskId || '-' }}</n-descriptions-item>
          <n-descriptions-item label="任务标签">{{ detail?.taskTag || '-' }}</n-descriptions-item>
          <n-descriptions-item label="状态">{{ downloadStatusLabel(detail?.status) }}</n-descriptions-item>
          <n-descriptions-item label="自动入库">{{ autoImportLabel(detail?.autoImportStatus) }}</n-descriptions-item>
          <n-descriptions-item label="种子哈希">{{ detail?.torrentHash || '-' }}</n-descriptions-item>
          <n-descriptions-item label="qB 状态">{{ detail?.qbtState || '-' }}</n-descriptions-item>
          <n-descriptions-item label="保存目录">{{ detail?.savePath || '-' }}</n-descriptions-item>
          <n-descriptions-item label="目录配置">{{ detail?.folderConfigName || '-' }}</n-descriptions-item>
          <n-descriptions-item label="创建时间">{{ formatTime(detail?.createTime) }}</n-descriptions-item>
          <n-descriptions-item label="最后同步">{{ formatTime(detail?.lastSyncedAt) }}</n-descriptions-item>
        </n-descriptions>
        <n-card size="small" title="错误信息">
          <n-text>{{ detail?.errorMessage || '-' }}</n-text>
        </n-card>
        <n-card size="small" title="入库日志">
          <n-text>{{ detail?.autoImportMessage || '-' }}</n-text>
        </n-card>
      </n-space>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DataTableColumns, SelectOption } from 'naive-ui'
import { NButton, NProgress, NTag, useMessage } from 'naive-ui'
import { adminApi, type AdminDownloadStatus, type AdminDownloadTask } from '@/api/admin'
import { folderApi } from '@/api/folder'
import { getErrorMessage } from '@/utils/error'
import type { FolderConfig } from '@/types'

const message = useMessage()
const loading = ref(false)
const creatingMagnet = ref(false)
const creatingTorrent = ref(false)
const autoRefresh = ref(true)
const tasks = ref<AdminDownloadTask[]>([])
const folders = ref<FolderConfig[]>([])
const status = ref<AdminDownloadStatus>({})
const detail = ref<AdminDownloadTask | null>(null)
const showDetail = ref(false)
const magnetUrl = ref('')
const selectedFolderId = ref<string | null>(null)
const addPaused = ref(false)
const selectedTorrentFile = ref<File | null>(null)
const torrentInputRef = ref<HTMLInputElement | null>(null)
let timer: number | null = null

const rowKey = (row: AdminDownloadTask) => row.taskId ?? ''

const folderOptions = computed<SelectOption[]>(() =>
  folders.value.map((folder) => ({
    label: `${folder.name} (${folder.path})`,
    value: folder.id
  }))
)

const statusTagType = (taskStatus?: string) => {
  if (taskStatus === 'completed') return 'success'
  if (taskStatus === 'failed') return 'error'
  if (taskStatus === 'downloading') return 'info'
  if (taskStatus === 'paused') return 'warning'
  return 'default'
}

const autoImportTagType = (importStatus?: string) => {
  if (importStatus === 'success') return 'success'
  if (importStatus === 'failed') return 'error'
  if (importStatus === 'running') return 'info'
  return 'warning'
}

const downloadStatusLabel = (taskStatus?: string) => {
  if (taskStatus === 'queued') return '排队中'
  if (taskStatus === 'downloading') return '下载中'
  if (taskStatus === 'paused') return '已暂停'
  if (taskStatus === 'completed') return '已完成'
  if (taskStatus === 'failed') return '失败'
  return '-'
}

const autoImportLabel = (importStatus?: string) => {
  if (importStatus === 'pending') return '待执行'
  if (importStatus === 'running') return '入库中'
  if (importStatus === 'success') return '已完成'
  if (importStatus === 'failed') return '失败'
  return '-'
}

const formatTime = (value?: string) => (value ? new Date(value).toLocaleString() : '-')

const formatBytes = (value?: number) => {
  const size = Number(value || 0)
  if (size <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let current = size
  let index = 0
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024
    index += 1
  }
  return `${current.toFixed(index === 0 ? 0 : 2)} ${units[index]}`
}

const formatEta = (value?: number) => {
  const seconds = Number(value || 0)
  if (seconds <= 0) return '-'
  const hour = Math.floor(seconds / 3600)
  const minute = Math.floor((seconds % 3600) / 60)
  const second = Math.floor(seconds % 60)
  if (hour > 0) return `${hour}时${minute}分`
  if (minute > 0) return `${minute}分${second}秒`
  return `${second}秒`
}

const columns = computed<DataTableColumns<AdminDownloadTask>>(() => [
  { title: '任务 ID', key: 'taskId', width: 180, ellipsis: { tooltip: true } },
  { title: '来源', key: 'sourceName', minWidth: 220, ellipsis: { tooltip: true }, render: (row) => row.sourceName || '-' },
  { title: '目录配置', key: 'folderConfigName', width: 180, ellipsis: { tooltip: true }, render: (row) => row.folderConfigName || '-' },
  { title: '状态', key: 'status', width: 110, render: (row) => h(NTag, { type: statusTagType(row.status), size: 'small' }, { default: () => downloadStatusLabel(row.status) }) },
  { title: '进度', key: 'progress', width: 180, render: (row) => h(NProgress, { percentage: Number(row.progress || 0), height: 10, showIndicator: true, processing: row.status === 'downloading' }) },
  { title: '速度', key: 'downloadSpeed', width: 120, render: (row) => `${formatBytes(row.downloadSpeed)}/s` },
  { title: '剩余时间', key: 'etaSeconds', width: 120, render: (row) => formatEta(row.etaSeconds) },
  { title: '保存目录', key: 'savePath', minWidth: 240, ellipsis: { tooltip: true }, render: (row) => row.savePath || '-' },
  { title: '入库状态', key: 'autoImportStatus', width: 120, render: (row) => h(NTag, { type: autoImportTagType(row.autoImportStatus), size: 'small' }, { default: () => autoImportLabel(row.autoImportStatus) }) },
  { title: '创建时间', key: 'createTime', width: 180, render: (row) => formatTime(row.createTime) },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    render: (row) => h('div', { class: 'action-cell' }, [
      h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => openDetail(row) }, { default: () => '详情' }),
      row.status === 'paused'
        ? h(NButton, { size: 'small', quaternary: true, type: 'info', onClick: () => handleResume(row) }, { default: () => '继续' })
        : h(NButton, { size: 'small', quaternary: true, type: 'warning', disabled: row.status === 'completed' || row.status === 'failed', onClick: () => handlePause(row) }, { default: () => '暂停' }),
      h(NButton, { size: 'small', quaternary: true, type: 'success', disabled: row.autoImportStatus !== 'failed', onClick: () => handleRetryImport(row) }, { default: () => '重试入库' }),
      h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => handleDelete(row, false) }, { default: () => '删任务' }),
      h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => handleDelete(row, true) }, { default: () => '删文件' })
    ])
  }
])

const ensureFolderSelected = () => {
  if (!selectedFolderId.value) {
    message.warning('请先选择入库目录')
    return false
  }
  return true
}

const loadTasks = async (silent = false) => {
  if (!silent) loading.value = true
  try {
    tasks.value = await adminApi.getDownloadTasks()
    if (showDetail.value && detail.value?.taskId) {
      detail.value = await adminApi.getDownloadTaskDetail(detail.value.taskId)
    }
  } catch (error) {
    if (!silent) {
      message.error(getErrorMessage(error))
    }
  } finally {
    loading.value = false
  }
}

const loadOverview = async (silent = false) => {
  if (!silent) loading.value = true
  try {
    const [downloadStatus, enabledFolders, downloadTasks] = await Promise.all([
      adminApi.getDownloadStatus(),
      folderApi.getEnabledFolders(),
      adminApi.getDownloadTasks()
    ])
    status.value = downloadStatus
    folders.value = enabledFolders
    tasks.value = downloadTasks
    if (!selectedFolderId.value && enabledFolders.length > 0) {
      selectedFolderId.value = enabledFolders[0].id
    }
    if (showDetail.value && detail.value?.taskId) {
      detail.value = await adminApi.getDownloadTaskDetail(detail.value.taskId)
    }
  } catch (error) {
    if (!silent) {
      message.error(getErrorMessage(error))
    }
  } finally {
    loading.value = false
  }
}

const handleCreateMagnet = async () => {
  if (!ensureFolderSelected()) return
  if (!magnetUrl.value.trim()) {
    message.warning('请输入磁力链接')
    return
  }
  const folderId = selectedFolderId.value as string
  creatingMagnet.value = true
  try {
    await adminApi.createDownloadMagnetTask({
      magnetUrl: magnetUrl.value.trim(),
      folderConfigId: folderId,
      addPaused: addPaused.value
    })
    magnetUrl.value = ''
    message.success('磁力任务已创建')
    await loadTasks(true)
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    creatingMagnet.value = false
  }
}

const handleCreateTorrent = async () => {
  if (!ensureFolderSelected() || !selectedTorrentFile.value) return
  const folderId = selectedFolderId.value as string
  creatingTorrent.value = true
  try {
    await adminApi.createDownloadTorrentTask(selectedTorrentFile.value, folderId, addPaused.value)
    selectedTorrentFile.value = null
    if (torrentInputRef.value) torrentInputRef.value.value = ''
    message.success('种子任务已创建')
    await loadTasks(true)
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    creatingTorrent.value = false
  }
}

const triggerTorrentPicker = () => {
  torrentInputRef.value?.click()
}

const handleTorrentFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedTorrentFile.value = target.files?.[0] || null
}

const openDetail = async (task: AdminDownloadTask) => {
  if (!task.taskId) return
  try {
    detail.value = await adminApi.getDownloadTaskDetail(task.taskId)
    showDetail.value = true
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handlePause = async (task: AdminDownloadTask) => {
  if (!task.taskId) return
  try {
    await adminApi.pauseDownloadTask(task.taskId)
    message.success('任务已暂停')
    await loadTasks(true)
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleResume = async (task: AdminDownloadTask) => {
  if (!task.taskId) return
  try {
    await adminApi.resumeDownloadTask(task.taskId)
    message.success('任务已继续')
    await loadTasks(true)
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleRetryImport = async (task: AdminDownloadTask) => {
  if (!task.taskId) return
  try {
    detail.value = await adminApi.retryDownloadTaskImport(task.taskId)
    message.success('已重新触发自动入库')
    await loadTasks(true)
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleDelete = async (task: AdminDownloadTask, deleteFiles: boolean) => {
  if (!task.taskId) return
  const confirmed = window.confirm(deleteFiles ? '确认删除任务并删除已下载文件？' : '确认仅删除任务记录？')
  if (!confirmed) return
  try {
    await adminApi.deleteDownloadTask(task.taskId, deleteFiles)
    if (detail.value?.taskId === task.taskId) {
      showDetail.value = false
      detail.value = null
    }
    message.success(deleteFiles ? '任务和文件已删除' : '任务已删除')
    await loadTasks(true)
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const startPolling = () => {
  stopPolling()
  timer = window.setInterval(() => {
    if (autoRefresh.value) {
      loadOverview(true)
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
  loadOverview()
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

.hidden-input {
  display: none;
}

:deep(.action-cell) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
