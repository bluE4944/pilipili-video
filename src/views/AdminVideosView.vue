<template>
  <div class="admin-view">
    <n-card>
      <n-space vertical :size="16">
        <n-space justify="space-between" align="center" :wrap="true">
          <n-space align="center" :wrap="true">
            <n-input v-model:value="filters.title" placeholder="标题" clearable style="width: 200px" />
            <n-select
              v-model:value="filters.status"
              placeholder="状态"
              clearable
              style="width: 160px"
              :options="statusOptions"
            />
            <n-button type="primary" @click="handleSearch">查询</n-button>
            <n-button @click="handleReset">重置</n-button>
          </n-space>
          <n-space align="center">
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
            v-model:value="batchStatus"
            placeholder="批量状态"
            clearable
            style="width: 160px"
            :options="statusOptions"
          />
          <n-input v-model:value="batchAuditRemark" placeholder="审核意见(可选)" style="width: 200px" />
          <n-button :disabled="!selectedIds.length" @click="handleBatchStatus">批量设置状态</n-button>
          <n-text depth="3">已选 {{ selectedIds.length }} 条</n-text>
        </n-space>

        <n-data-table
          :columns="columns"
          :data="videos"
          :loading="loading"
          :row-key="rowKey"
          :checked-row-keys="selectedRowKeys"
          :pagination="false"
          @update:checked-row-keys="handleSelectionChange"
        />

        <n-space justify="end">
          <n-pagination
            v-model:page="page"
            v-model:page-size="pageSize"
            :item-count="total"
            show-size-picker
            :page-sizes="[10, 20, 50]"
            @update:page="loadVideos"
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
        <n-form-item label="分类ID">
          <n-input-number v-model:value="fieldsForm.categoryId" placeholder="分类ID" :min="1" />
        </n-form-item>
        <n-form-item label="分类名称">
          <n-input v-model:value="fieldsForm.categoryName" placeholder="分类名称" />
        </n-form-item>
        <n-form-item label="标签">
          <n-input v-model:value="fieldsForm.tags" placeholder="标签(逗号分隔)" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showFieldsDialog = false">取消</n-button>
          <n-button type="primary" @click="handleFieldsSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NTag, useMessage } from 'naive-ui'
import { adminApi, type AdminBatchVideoUpdatePayload } from '@/api/admin'
import type { BackendVideo } from '@/types'
import { getErrorMessage } from '@/utils/error'
import { resolveApiUrl } from '@/utils/api'
import { getFallbackCover } from '@/utils/fallbackCover'

const message = useMessage()

const loading = ref(false)
const videos = ref<BackendVideo[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRowKeys = ref<Array<string | number>>([])

const filters = reactive({
  title: '',
  status: null as number | null
})

const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '已上线', value: 1 },
  { label: '已下架', value: 2 },
  { label: '审核不通过', value: 3 }
]

const batchStatus = ref<number | null>(null)
const batchAuditRemark = ref('')

const showFieldsDialog = ref(false)
const fieldsDialogTitle = ref('批量更新字段')
const fieldsTargetIds = ref<number[]>([])
const fieldsForm = reactive<AdminBatchVideoUpdatePayload>({
  videoIds: [],
  title: '',
  categoryId: undefined,
  categoryName: '',
  tags: ''
})

const rowKey = (row: BackendVideo) => row.id ?? ''

const selectedIds = computed(() => {
  return selectedRowKeys.value
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value))
})

const formatTime = (value?: string) => {
  if (!value) return '-'
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return value
  return new Date(parsed).toLocaleString()
}

const statusLabel = (status?: number) => {
  const option = statusOptions.find((item) => item.value === status)
  return option ? option.label : '-'
}

const statusTagType = (status?: number) => {
  if (status === 1) return 'success'
  if (status === 2) return 'warning'
  if (status === 3) return 'error'
  return 'info'
}

const columns = computed<DataTableColumns<BackendVideo>>(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 140, ellipsis: { tooltip: true } },
  {
    title: '封面',
    key: 'cover',
    width: 140,
    render: (row) =>
      h('div', { class: 'cover-cell' }, [
        h('img', {
          class: 'cover-img',
          src: resolveCoverUrl(row)
        }),
        h(
          NButton,
          { size: 'small', quaternary: true, onClick: () => handleCoverUpload(row) },
          { default: () => '更换' }
        )
      ])
  },
  { title: '标题', key: 'title', ellipsis: { tooltip: true }, render: (row) => row.title || '-' },
  {
    title: '状态',
    key: 'status',
    render: (row) => h(NTag, { type: statusTagType(row.status), size: 'small' }, { default: () => statusLabel(row.status) })
  },
  { title: '作者', key: 'userName', render: (row) => row.userName || '-' },
  { title: '分类', key: 'categoryName', render: (row) => row.categoryName || '-' },
  { title: '标签', key: 'tags', render: (row) => row.tags || '-' },
  { title: '创建时间', key: 'createTime', width: 200, ellipsis: { tooltip: true }, render: (row) => formatTime(row.createTime) },
  {
    title: '操作',
    key: 'actions',
    render: (row) =>
      h('div', { class: 'action-group' }, [
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

const loadVideos = async () => {
  loading.value = true
  try {
    const result = await adminApi.getVideosPage({
      pageNum: page.value,
      pageSize: pageSize.value,
      title: filters.title || undefined,
      status: filters.status === null ? undefined : filters.status
    })
    videos.value = result.records || []
    total.value = result.total || 0
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadVideos()
}

const handleReset = () => {
  filters.title = ''
  filters.status = null
  page.value = 1
  loadVideos()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  page.value = 1
  loadVideos()
}

const handleSelectionChange = (keys: Array<string | number>) => {
  selectedRowKeys.value = keys
}

const handleDelete = async (video: BackendVideo) => {
  if (!video.id) {
    message.warning('视频ID无效')
    return
  }
  if (!window.confirm('确认删除该视频吗？')) return
  try {
    await adminApi.deleteVideos([Number(video.id)])
    message.success('删除成功')
    loadVideos()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return
  if (!window.confirm(`确认删除选中的 ${selectedIds.value.length} 条视频吗？`)) return
  try {
    await adminApi.deleteVideos(selectedIds.value)
    message.success('批量删除成功')
    selectedRowKeys.value = []
    loadVideos()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleBatchStatus = async () => {
  if (!selectedIds.value.length) {
    message.warning('请选择视频')
    return
  }
  if (batchStatus.value === null) {
    message.warning('请选择状态')
    return
  }
  try {
    await adminApi.updateVideoStatusBatch(selectedIds.value, batchStatus.value, batchAuditRemark.value || undefined)
    message.success('状态更新成功')
    loadVideos()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const openBatchFieldsDialog = (ids: number[]) => {
  if (!ids.length) return
  fieldsTargetIds.value = ids
  fieldsDialogTitle.value = ids.length > 1 ? `批量更新(${ids.length})` : '编辑视频'
  Object.assign(fieldsForm, {
    videoIds: ids,
    title: '',
    categoryId: undefined,
    categoryName: '',
    tags: ''
  })
  showFieldsDialog.value = true
}

const handleFieldsSubmit = async () => {
  if (!fieldsTargetIds.value.length) {
    message.warning('请选择视频')
    return
  }
  const payload: AdminBatchVideoUpdatePayload = {
    videoIds: fieldsTargetIds.value
  }
  if (fieldsForm.title && fieldsForm.title.trim()) payload.title = fieldsForm.title.trim()
  if (fieldsForm.categoryId) payload.categoryId = fieldsForm.categoryId
  if (fieldsForm.categoryName && fieldsForm.categoryName.trim()) payload.categoryName = fieldsForm.categoryName.trim()
  if (fieldsForm.tags !== undefined && fieldsForm.tags !== null) payload.tags = fieldsForm.tags

  if (!payload.title && !payload.categoryId && !payload.categoryName && payload.tags === undefined) {
    message.warning('至少填写一个字段')
    return
  }
  try {
    await adminApi.updateVideoFieldsBatch(payload)
    message.success('更新成功')
    showFieldsDialog.value = false
    loadVideos()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const resolveCoverUrl = (video: BackendVideo) => {
  const url = resolveApiUrl(video.coverUrl)
  if (url) return url
  return getFallbackCover(video.id ?? '')
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

const handleCoverUpload = async (video: BackendVideo) => {
  if (!video.id) {
    message.warning('视频ID无效')
    return
  }
  const file = await selectImageFile()
  if (!file) return
  message.loading('正在上传封面...', { key: 'uploadCover', duration: 0 })
  try {
    const updated = await adminApi.uploadVideoCover(video.id, file)
    if (updated?.coverUrl) {
      video.coverUrl = updated.coverUrl
    }
    message.success('封面已更新', { key: 'uploadCover' })
  } catch (error) {
    message.error(getErrorMessage(error), { key: 'uploadCover' })
  }
}

onMounted(() => {
  loadVideos()
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
  gap: 8px;
}

.cover-img {
  width: 56px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
