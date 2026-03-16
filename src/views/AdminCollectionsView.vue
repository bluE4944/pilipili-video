<template>
  <div class="admin-view">
    <n-card>
      <n-space vertical :size="16">
        <n-space justify="space-between" align="center" :wrap="true">
          <n-space align="center" :wrap="true">
            <n-input v-model:value="filters.title" placeholder="标题" clearable style="width: 200px" />
            <n-select
              v-model:value="filters.collectionType"
              placeholder="类型"
              clearable
              style="width: 160px"
              :options="collectionTypeOptions"
            />
            <n-select
              v-model:value="filters.enabled"
              placeholder="启用状态"
              clearable
              style="width: 160px"
              :options="enabledOptions"
            />
            <n-button type="primary" @click="handleSearch">查询</n-button>
            <n-button @click="handleReset">重置</n-button>
          </n-space>
          <n-space align="center">
            <n-button type="primary" @click="openCreateDialog">新建合集</n-button>
            <n-button type="error" :disabled="!selectedIds.length" @click="handleBatchDelete">
              批量删除
            </n-button>
            <n-button :disabled="!selectedIds.length" @click="openBatchFieldsDialog(selectedIds)">
              批量更新字段
            </n-button>
          </n-space>
        </n-space>

        <n-space align="center" :wrap="true">
          <n-select
            v-model:value="batchEnabled"
            placeholder="批量启用状态"
            clearable
            style="width: 160px"
            :options="enabledOptions"
          />
          <n-button :disabled="!selectedIds.length" @click="handleBatchEnabled">批量设置启用</n-button>
          <n-text depth="3">已选 {{ selectedIds.length }} 条</n-text>
        </n-space>

        <n-data-table
          :columns="columns"
          :data="collections"
          :loading="loading"
          :row-key="rowKey"
          :checked-row-keys="selectedRowKeys"
          :pagination="false"
          :scroll-x="tableScrollX"
          @update:checked-row-keys="handleSelectionChange"
        />

        <n-space justify="end">
          <n-pagination
            v-model:page="page"
            v-model:page-size="pageSize"
            :item-count="total"
            show-size-picker
            :page-sizes="[10, 20, 50]"
            @update:page="loadCollections"
            @update:page-size="handlePageSizeChange"
          />
        </n-space>
      </n-space>
    </n-card>

    <n-modal v-model:show="showFieldsDialog" preset="dialog" :title="fieldsDialogTitle">
      <n-form :model="fieldsForm">
        <n-form-item label="标题">
          <n-input v-model:value="fieldsForm.title" placeholder="标题" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="fieldsForm.description" type="textarea" placeholder="描述" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showFieldsDialog = false">取消</n-button>
          <n-button type="primary" @click="handleFieldsSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showCreateDialog" preset="dialog" title="新建合集">
      <n-form :model="createForm">
        <n-form-item label="标题">
          <n-input v-model:value="createForm.title" placeholder="请输入合集标题" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="createForm.description" type="textarea" placeholder="合集描述(可选)" />
        </n-form-item>
        <n-form-item label="类型">
          <n-select v-model:value="createForm.collectionType" :options="collectionTypeOptions" />
        </n-form-item>
        <n-form-item label="启用">
          <n-select v-model:value="createForm.enabled" :options="enabledOptions" />
        </n-form-item>
        <n-form-item label="源路径">
          <n-input v-model:value="createForm.sourceFolderPath" placeholder="源文件夹路径(可选)" />
        </n-form-item>
        <n-form-item label="封面">
          <n-space align="center">
            <n-button size="small" @click="handleSelectCreateCover">选择封面</n-button>
            <n-button v-if="createCoverFile" size="small" @click="clearCreateCover">清除</n-button>
            <img v-if="createCoverPreview" class="cover-preview-small" :src="createCoverPreview" alt="封面预览" />
          </n-space>
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showCreateDialog = false">取消</n-button>
          <n-button type="primary" :loading="creatingCollection" @click="handleCreateCollection">创建</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showEpisodesDialog" preset="card" title="合集分集管理" style="width: 1300px">
      <n-space vertical :size="12">
        <n-space justify="space-between" align="center" :wrap="true">
          <n-text strong>合集：{{ currentCollection?.title || '-' }}</n-text>
          <n-space align="center" :wrap="true">
            <n-button size="small" @click="applySortByEpisodeNumber">按集数排序</n-button>
            <n-button size="small" type="warning" :disabled="!selectedEpisodeIds.length" @click="handleRemoveEpisodes">
              移除所选
            </n-button>
            <n-button size="small" type="primary" @click="handleSaveEpisodes">保存调整</n-button>
            <n-button size="small" @click="loadEpisodes">刷新</n-button>
          </n-space>
        </n-space>
        <n-data-table
          :columns="episodeColumns"
          :data="pagedEpisodes"
          :loading="episodesLoading"
          :row-key="(row) => row.id ?? row.videoId ?? ''"
          :checked-row-keys="episodeSelectedRowKeys"
          :scroll-x="episodeTableScrollX"
          @update:checked-row-keys="handleEpisodeSelectionChange"
        />
        <n-space justify="end">
          <n-pagination
            v-model:page="episodePage"
            v-model:page-size="episodePageSize"
            :item-count="editableEpisodes.length"
            show-size-picker
            :page-sizes="[10, 20, 50]"
            @update:page-size="handleEpisodePageSizeChange"
          />
        </n-space>
      </n-space>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NInput, NInputNumber, NPopover, NTag, useMessage } from 'naive-ui'
import { adminApi, type AdminBatchCollectionUpdatePayload, type AdminCollectionPayload, type AdminEpisodeUpdateItem } from '@/api/admin'
import type { BackendVideoCollection, BackendVideoEpisode } from '@/types'
import { getErrorMessage } from '@/utils/error'
import { useRouter } from 'vue-router'
import { resolveApiUrl } from '@/utils/api'
import { getFallbackCover } from '@/utils/fallbackCover'

const message = useMessage()
const router = useRouter()

const loading = ref(false)
const collections = ref<BackendVideoCollection[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRowKeys = ref<Array<string | number>>([])

const filters = reactive({
  title: '',
  collectionType: null as number | null,
  enabled: null as number | null
})

const collectionTypeOptions = [
  { label: '自动整合', value: 1 },
  { label: '手动创建', value: 2 }
]

const enabledOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const batchEnabled = ref<number | null>(null)

const showFieldsDialog = ref(false)
const fieldsDialogTitle = ref('批量更新字段')
const fieldsTargetIds = ref<number[]>([])
const fieldsForm = reactive<AdminBatchCollectionUpdatePayload>({
  collectionIds: [],
  title: '',
  description: ''
})

const showEpisodesDialog = ref(false)
const episodesLoading = ref(false)
const currentCollection = ref<BackendVideoCollection | null>(null)
const editableEpisodes = ref<BackendVideoEpisode[]>([])
const episodeSelectedRowKeys = ref<Array<string | number>>([])
const episodePage = ref(1)
const episodePageSize = ref(10)

const showCreateDialog = ref(false)
const createForm = reactive<AdminCollectionPayload>({
  title: '',
  description: '',
  sourceFolderPath: '',
  collectionType: 2,
  enabled: 1
})
const createCoverFile = ref<File | null>(null)
const createCoverPreview = ref('')
const creatingCollection = ref(false)

const rowKey = (row: BackendVideoCollection) => row.id ?? ''

const selectedIds = computed(() => {
  return selectedRowKeys.value
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value))
})

const tableScrollX = 1200
const episodeTableScrollX = 1300

const formatTime = (value?: string) => {
  if (!value) return '-'
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return value
  return new Date(parsed).toLocaleString()
}

const enabledLabel = (value?: number) => (value === 1 ? '启用' : value === 0 ? '禁用' : '-')

const renderCoverPreview = (url: string, onClick: () => void, disabled: boolean) => {
  return h(
    NPopover,
    { trigger: 'hover', placement: 'right', showArrow: false },
    {
      trigger: () =>
        h('img', {
          class: 'cover-img',
          src: url,
          style: {
            width: '56px',
            height: '36px',
            objectFit: 'cover',
            borderRadius: '3px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'block'
          },
          onClick: disabled ? undefined : onClick
        }),
      default: () =>
        h('img', {
          class: 'cover-preview',
          src: url,
          style: {
            width: '260px',
            height: '160px',
            objectFit: 'cover',
            borderRadius: '8px',
            display: 'block',
            boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)'
          }
        })
    }
  )
}

const columns = computed<DataTableColumns<BackendVideoCollection>>(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 140, ellipsis: { tooltip: true } },
  {
    title: '封面',
    key: 'cover',
    width: 110,
    render: (row) =>
      h('div', { class: 'cover-cell' }, [
        renderCoverPreview(resolveCollectionCover(row), () => handleCollectionCoverUpload(row), isCoverUploading(row.id))
      ])
  },
  { title: '标题', key: 'title', ellipsis: { tooltip: true }, render: (row) => row.title || '-' },
  {
    title: '启用',
    key: 'enabled',
    render: (row) => h(NTag, { type: row.enabled === 1 ? 'success' : 'warning', size: 'small' }, { default: () => enabledLabel(row.enabled) })
  },
  {
    title: '类型',
    key: 'collectionType',
    render: (row) => (row.collectionType === 2 ? '手动' : '自动')
  },
  { title: '视频数', key: 'videoCount', render: (row) => row.videoCount ?? 0 },
  { title: '创建时间', key: 'createTime', render: (row) => formatTime(row.createTime), width: 150 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) =>
      h('div', { class: 'action-group' }, [
        h(
          NButton,
          { size: 'small', quaternary: true, onClick: () => openEpisodesDialog(row) },
          { default: () => '分集' }
        ),
        h(
          NButton,
          { size: 'small', quaternary: true, type: 'primary', onClick: () => openBatchFieldsDialog([Number(row.id)]) },
          { default: () => '编辑' }
        ),
        h(
          NButton,
          { size: 'small', quaternary: true, type: 'error', onClick: () => handleDelete(row) },
          { default: () => '删除' }
        )
      ])
  }
])

const episodeColumns = computed<DataTableColumns<BackendVideoEpisode>>(() => [
  { type: 'selection' },
  {
    title: '集数',
    key: 'episodeNumber',
    width: 100,
    render: (row) =>
      h(NInput, {
        value: row.episodeNumber || '',
        placeholder: '集数',
        size: 'small',
        onUpdateValue: (value) => {
          row.episodeNumber = value
        }
      })
  },
  {
    title: '名称',
    key: 'episodeName',
    ellipsis: { tooltip: true },
    render: (row) =>
      h(NInput, {
        value: row.episodeName || '',
        placeholder: '分集名称',
        size: 'small',
        onUpdateValue: (value) => {
          row.episodeName = value
        }
      })
  },
  { title: '视频ID', key: 'videoId', width: 140, ellipsis: { tooltip: true }, render: (row) => row.videoId ?? '-' },
  { title: '格式', key: 'fileFormat', width: 80, render: (row) => row.fileFormat || '-' },
  { title: '大小', key: 'fileSize', width: 100, render: (row) => formatFileSize(row.fileSize) },
  { title: '路径', key: 'filePath', width: 360, ellipsis: { tooltip: true }, render: (row) => row.filePath || '-' },
  { title: '更新时间', key: 'fileModifyTime', width: 180, ellipsis: { tooltip: true }, render: (row) => formatTime(row.fileModifyTime) },
  {
    title: '排序',
    key: 'sortOrder',
    width: 120,
    render: (row) =>
      h(NInputNumber, {
        value: row.sortOrder ?? 0,
        min: 0,
        size: 'small',
        onUpdateValue: (value) => {
          row.sortOrder = value === null ? 0 : value
        }
      })
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render: (row) => {
      const episodeId = row.id !== undefined && row.id !== null ? Number(row.id) : Number.NaN
      const canRemove = !Number.isNaN(episodeId)
      return h('div', { class: 'action-group' }, [
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'primary',
            disabled: !row.videoId,
            onClick: () => goToVideoDetail(row.videoId)
          },
          { default: () => '查看视频' }
        ),
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'error',
            disabled: !canRemove,
            onClick: () => handleRemoveEpisodes([episodeId])
          },
          { default: () => '移除' }
        )
      ])
    }
  }
])

const loadCollections = async () => {
  loading.value = true
  try {
    const result = await adminApi.getCollectionsPage({
      pageNum: page.value,
      pageSize: pageSize.value,
      title: filters.title || undefined,
      collectionType: filters.collectionType === null ? undefined : filters.collectionType,
      enabled: filters.enabled === null ? undefined : filters.enabled
    })
    collections.value = result.records || []
    total.value = result.total || 0
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadCollections()
}

const handleReset = () => {
  filters.title = ''
  filters.collectionType = null
  filters.enabled = null
  page.value = 1
  loadCollections()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  page.value = 1
  loadCollections()
}

const handleSelectionChange = (keys: Array<string | number>) => {
  selectedRowKeys.value = keys
}

const handleDelete = async (collection: BackendVideoCollection) => {
  if (!collection.id) {
    message.warning('合集ID无效')
    return
  }
  if (!window.confirm('确认删除该合集吗？')) return
  try {
    await adminApi.deleteCollections([Number(collection.id)])
    message.success('删除成功')
    loadCollections()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return
  if (!window.confirm(`确认删除选中的 ${selectedIds.value.length} 条合集吗？`)) return
  try {
    await adminApi.deleteCollections(selectedIds.value)
    message.success('批量删除成功')
    selectedRowKeys.value = []
    loadCollections()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleBatchEnabled = async () => {
  if (!selectedIds.value.length) {
    message.warning('请选择合集')
    return
  }
  if (batchEnabled.value === null) {
    message.warning('请选择启用状态')
    return
  }
  try {
    await adminApi.updateCollectionEnabledBatch(selectedIds.value, batchEnabled.value)
    message.success('更新成功')
    loadCollections()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const openCreateDialog = () => {
  Object.assign(createForm, {
    title: '',
    description: '',
    sourceFolderPath: '',
    collectionType: 2,
    enabled: 1
  })
  clearCreateCover()
  showCreateDialog.value = true
}

const handleSelectCreateCover = async () => {
  const file = await selectImageFile()
  if (!file) return
  clearCreateCover()
  createCoverFile.value = file
  createCoverPreview.value = URL.createObjectURL(file)
}

const clearCreateCover = () => {
  if (createCoverPreview.value && createCoverPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(createCoverPreview.value)
  }
  createCoverFile.value = null
  createCoverPreview.value = ''
}

const handleCreateCollection = async () => {
  if (!createForm.title || !createForm.title.trim()) {
    message.warning('请输入合集标题')
    return
  }
  try {
    creatingCollection.value = true
    const created = await adminApi.createCollection({
      title: createForm.title.trim(),
      description: createForm.description || '',
      sourceFolderPath: createForm.sourceFolderPath || '',
      collectionType: createForm.collectionType ?? 2,
      enabled: createForm.enabled ?? 1
    })
    if (created?.id && createCoverFile.value) {
      try {
        await adminApi.uploadCollectionCover(created.id, createCoverFile.value)
      } catch (error) {
        message.warning(`封面上传失败：${getErrorMessage(error)}`)
      }
    }
    message.success('合集已创建')
    showCreateDialog.value = false
    clearCreateCover()
    loadCollections()
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    creatingCollection.value = false
  }
}

const resolveCollectionCover = (collection: BackendVideoCollection) => {
  const url = resolveApiUrl(collection.coverUrl)
  if (url) return url
  return getFallbackCover(collection.id ?? '')
}

const appendCoverTimestamp = (url?: string) => {
  if (!url) return url
  const mark = url.includes('?') ? '&' : '?'
  return `${url}${mark}t=${Date.now()}`
}

const uploadingCoverIds = ref<Set<string>>(new Set())

const isCoverUploading = (id?: number | string) => {
  if (!id && id !== 0) return false
  return uploadingCoverIds.value.has(String(id))
}

const selectImageFile = () => {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      resolve(input.files?.[0] ?? null)
    }
    input.click()
  })
}

const handleCollectionCoverUpload = async (collection: BackendVideoCollection) => {
  if (!collection.id && collection.id !== 0) {
    message.warning('合集ID无效')
    return
  }
  const key = String(collection.id)
  if (uploadingCoverIds.value.has(key)) return
  const file = await selectImageFile()
  if (!file) return
  uploadingCoverIds.value.add(key)
  const messageKey = `upload-cover-${key}`
  const loadingMessage = message.loading('正在上传封面...', { key: messageKey, duration: 0 })
  try {
    const updated = await adminApi.uploadCollectionCover(collection.id, file)
    if (updated?.coverUrl) {
      collection.coverUrl = appendCoverTimestamp(updated.coverUrl)
    }
    await loadCollections()
    message.success('封面已更新', { key: messageKey })
  } catch (error) {
    message.error(getErrorMessage(error), { key: messageKey })
  } finally {
    loadingMessage?.destroy()
    uploadingCoverIds.value.delete(key)
  }
}

const openBatchFieldsDialog = (ids: number[]) => {
  if (!ids.length) return
  fieldsTargetIds.value = ids
  fieldsDialogTitle.value = ids.length > 1 ? `批量更新(${ids.length})` : '编辑合集'
  Object.assign(fieldsForm, {
    collectionIds: ids,
    title: '',
    description: ''
  })
  showFieldsDialog.value = true
}

const handleFieldsSubmit = async () => {
  if (!fieldsTargetIds.value.length) {
    message.warning('请选择合集')
    return
  }
  const payload: AdminBatchCollectionUpdatePayload = {
    collectionIds: fieldsTargetIds.value
  }
  if (fieldsForm.title && fieldsForm.title.trim()) payload.title = fieldsForm.title.trim()
  if (fieldsForm.description !== undefined && fieldsForm.description !== null) payload.description = fieldsForm.description

  if (!payload.title && payload.description === undefined) {
    message.warning('至少填写一个字段')
    return
  }
  try {
    await adminApi.updateCollectionFieldsBatch(payload)
    message.success('更新成功')
    showFieldsDialog.value = false
    loadCollections()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const openEpisodesDialog = (collection: BackendVideoCollection) => {
  currentCollection.value = collection
  showEpisodesDialog.value = true
  loadEpisodes()
}

const loadEpisodes = async () => {
  const collectionId = currentCollection.value?.id
  if (!collectionId) return
  episodesLoading.value = true
  try {
    const result = await adminApi.getCollectionEpisodes(collectionId)
    editableEpisodes.value = result.map((item) => ({ ...item }))
    episodeSelectedRowKeys.value = []
    episodePage.value = 1
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    episodesLoading.value = false
  }
}

const pagedEpisodes = computed(() => {
  const start = (episodePage.value - 1) * episodePageSize.value
  return editableEpisodes.value.slice(start, start + episodePageSize.value)
})

const selectedEpisodeIds = computed(() => {
  return episodeSelectedRowKeys.value
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value))
})

const handleEpisodeSelectionChange = (keys: Array<string | number>) => {
  episodeSelectedRowKeys.value = keys
}

const handleEpisodePageSizeChange = (size: number) => {
  episodePageSize.value = size
  episodePage.value = 1
}

const handleRemoveEpisodes = async (ids?: number[]) => {
  const collectionId = currentCollection.value?.id
  if (!collectionId) return
  const targetIds = ids && ids.length ? ids : selectedEpisodeIds.value
  if (!targetIds.length) {
    message.warning('请选择分集')
    return
  }
  if (!window.confirm(`确认移除选中的 ${targetIds.length} 个分集吗？`)) return
  try {
    await adminApi.deleteCollectionEpisodes(collectionId, targetIds)
    message.success('移除成功')
    loadEpisodes()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const applySortByEpisodeNumber = () => {
  const sorted = [...editableEpisodes.value].sort((a, b) => {
    return parseEpisodeNumber(a.episodeNumber) - parseEpisodeNumber(b.episodeNumber)
  })
  sorted.forEach((item, index) => {
    item.sortOrder = index + 1
  })
  editableEpisodes.value = sorted
}

const handleSaveEpisodes = async () => {
  const collectionId = currentCollection.value?.id
  if (!collectionId) return
  const targetIds = selectedEpisodeIds.value.length
    ? selectedEpisodeIds.value
    : editableEpisodes.value.map((item) => Number(item.id)).filter((value) => !Number.isNaN(value))
  if (!targetIds.length) {
    message.warning('请选择分集')
    return
  }
  const items: AdminEpisodeUpdateItem[] = editableEpisodes.value
    .filter((item) => item.id && targetIds.includes(Number(item.id)))
    .map((item) => {
      const payload: AdminEpisodeUpdateItem = { id: Number(item.id) }
      if (item.episodeNumber !== undefined && item.episodeNumber !== null) {
        payload.episodeNumber = item.episodeNumber
      }
      if (item.episodeName !== undefined && item.episodeName !== null) {
        payload.episodeName = item.episodeName
      }
      if (item.sortOrder !== undefined && item.sortOrder !== null) {
        payload.sortOrder = item.sortOrder
      }
      return payload
    })
  if (!items.length) {
    message.warning('没有可保存的数据')
    return
  }
  try {
    await adminApi.updateCollectionEpisodes(collectionId, items)
    message.success('保存成功')
    loadEpisodes()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const goToVideoDetail = (videoId?: number) => {
  if (!videoId) return
  router.push({ name: 'videoDetail', params: { id: String(videoId) } })
}

const formatFileSize = (size?: number) => {
  if (!size) return '-'
  const mb = size / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(2)} MB`
  const kb = size / 1024
  return `${kb.toFixed(0)} KB`
}

const parseEpisodeNumber = (value?: string) => {
  if (!value) return Number.MAX_SAFE_INTEGER
  const match = value.match(/\d+/)
  if (!match) return Number.MAX_SAFE_INTEGER
  return Number(match[0])
}

onMounted(() => {
  loadCollections()
})
</script>

<style scoped lang="scss">
.admin-view {
  max-width: 1200px;
  margin: 0 auto;
}

.action-group {
  display: flex;
  gap: 8px;
}

.cover-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.cover-img {
  width: 32px;
  height: 20px;
  object-fit: cover;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.cover-preview {
  width: 260px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.cover-preview-small {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: block;
}
</style>
