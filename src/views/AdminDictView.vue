<template>
  <div class="admin-view">
    <n-card>
      <n-space vertical :size="16">
        <n-space justify="space-between" align="center" :wrap="true">
          <n-space align="center" :wrap="true">
            <n-input v-model:value="filters.dictCode" placeholder="字典编码" clearable style="width: 160px" />
            <n-input v-model:value="filters.dictName" placeholder="字典名称" clearable style="width: 160px" />
            <n-select
              v-model:value="filters.enabled"
              placeholder="启用状态"
              clearable
              style="width: 140px"
              :options="enabledOptions"
            />
            <n-button type="primary" @click="handleSearch">查询</n-button>
            <n-button @click="handleReset">重置</n-button>
          </n-space>
          <n-space align="center">
            <n-button type="primary" @click="openDictDialog()">新建字典</n-button>
            <n-button type="error" :disabled="!selectedIds.length" @click="handleBatchDelete">
              批量删除
            </n-button>
          </n-space>
        </n-space>

        <n-data-table
          :columns="columns"
          :data="dicts"
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
            @update:page="loadDicts"
            @update:page-size="handlePageSizeChange"
          />
        </n-space>
      </n-space>
    </n-card>

    <n-modal v-model:show="showDictDialog" preset="dialog" :title="dictDialogTitle">
      <n-form :model="dictForm">
        <n-form-item label="字典编码">
          <n-input v-model:value="dictForm.dictCode" :disabled="!!editingDict" placeholder="字典编码" />
        </n-form-item>
        <n-form-item label="字典名称">
          <n-input v-model:value="dictForm.dictName" placeholder="字典名称" />
        </n-form-item>
        <n-form-item label="启用状态">
          <n-select v-model:value="dictForm.enabled" :options="enabledOptions" />
        </n-form-item>
        <n-form-item label="排序序号">
          <n-input-number v-model:value="dictForm.sortOrder" :min="0" placeholder="排序" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="dictForm.description" type="textarea" placeholder="描述" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showDictDialog = false">取消</n-button>
          <n-button type="primary" @click="handleSaveDict">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showItemsDialog" preset="card" title="字典项管理" style="width: 1100px">
      <n-space vertical :size="12">
        <n-space justify="space-between" align="center" :wrap="true">
          <n-text strong>字典：{{ currentDict?.dictName || '-' }}（{{ currentDict?.dictCode || '-' }}）</n-text>
          <n-space align="center" :wrap="true">
            <n-button size="small" type="primary" @click="openItemDialog()">新建字典项</n-button>
            <n-button size="small" type="error" :disabled="!selectedItemIds.length" @click="handleItemBatchDelete">
              批量删除
            </n-button>
            <n-button size="small" @click="loadItems">刷新</n-button>
          </n-space>
        </n-space>

        <n-data-table
          :columns="itemColumns"
          :data="items"
          :loading="itemsLoading"
          :row-key="itemRowKey"
          :checked-row-keys="itemSelectedRowKeys"
          :scroll-x="itemTableScrollX"
          @update:checked-row-keys="handleItemSelectionChange"
        />
      </n-space>
    </n-modal>

    <n-modal v-model:show="showItemDialog" preset="dialog" :title="itemDialogTitle">
      <n-form :model="itemForm">
        <n-form-item label="字典项值">
          <n-input v-model:value="itemForm.itemValue" placeholder="字典项值" />
        </n-form-item>
        <n-form-item label="字典项名称">
          <n-input v-model:value="itemForm.itemLabel" placeholder="字典项名称" />
        </n-form-item>
        <n-form-item label="启用状态">
          <n-select v-model:value="itemForm.enabled" :options="enabledOptions" />
        </n-form-item>
        <n-form-item label="排序序号">
          <n-input-number v-model:value="itemForm.sortOrder" :min="0" placeholder="排序" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="itemForm.remark" type="textarea" placeholder="备注" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showItemDialog = false">取消</n-button>
          <n-button type="primary" @click="handleSaveItem">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NTag, useMessage } from 'naive-ui'
import { adminApi, type AdminDictItemPayload, type AdminDictPayload } from '@/api/admin'
import type { BackendId, BackendDict, BackendDictItem } from '@/types'
import { getErrorMessage } from '@/utils/error'

const message = useMessage()

const loading = ref(false)
const dicts = ref<BackendDict[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRowKeys = ref<BackendId[]>([])

const filters = reactive({
  dictCode: '',
  dictName: '',
  enabled: null as number | null
})

const enabledOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const showDictDialog = ref(false)
const editingDict = ref<BackendDict | null>(null)
const dictForm = reactive<AdminDictPayload>({
  dictCode: '',
  dictName: '',
  description: '',
  enabled: 1,
  sortOrder: 0
})

const showItemsDialog = ref(false)
const currentDict = ref<BackendDict | null>(null)
const items = ref<BackendDictItem[]>([])
const itemsLoading = ref(false)
const itemSelectedRowKeys = ref<BackendId[]>([])

const showItemDialog = ref(false)
const editingItem = ref<BackendDictItem | null>(null)
const itemForm = reactive<AdminDictItemPayload>({
  itemValue: '',
  itemLabel: '',
  enabled: 1,
  sortOrder: 0,
  remark: ''
})

const dictDialogTitle = computed(() => (editingDict.value ? '编辑字典' : '新建字典'))
const itemDialogTitle = computed(() => (editingItem.value ? '编辑字典项' : '新建字典项'))

const rowKey = (row: BackendDict) => row.id ?? row.dictCode ?? ''
const itemRowKey = (row: BackendDictItem) => row.id ?? row.itemValue ?? ''

const selectedIds = computed(() => {
  return selectedRowKeys.value
    .filter((value) => value !== undefined && value !== null && String(value) !== '')
    .map((value) => String(value))
})

const selectedItemIds = computed(() => {
  return itemSelectedRowKeys.value
    .filter((value) => value !== undefined && value !== null && String(value) !== '')
    .map((value) => String(value))
})

const tableScrollX = 900
const itemTableScrollX = 1000

const formatTime = (value?: string) => {
  if (!value) return '-'
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return value
  return new Date(parsed).toLocaleString()
}

const columns = computed<DataTableColumns<BackendDict>>(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 140, ellipsis: { tooltip: true } },
  { title: '字典编码', key: 'dictCode', width: 160, ellipsis: { tooltip: true } },
  { title: '字典名称', key: 'dictName', width: 160, ellipsis: { tooltip: true } },
  {
    title: '启用状态',
    key: 'enabled',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: row.enabled === 1 ? 'success' : 'warning', size: 'small' },
        { default: () => (row.enabled === 1 ? '启用' : '禁用') }
      )
  },
  { title: '排序', key: 'sortOrder', width: 80 },
  {
    title: '创建时间',
    key: 'createTime',
    width: 200,
    ellipsis: { tooltip: true },
    render: (row) => formatTime(row.createTime)
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) =>
      h('div', { class: 'action-group' }, [
        h(
          NButton,
          { size: 'small', quaternary: true, type: 'primary', onClick: () => openDictDialog(row) },
          { default: () => '编辑' }
        ),
        h(
          NButton,
          { size: 'small', quaternary: true, type: 'info', onClick: () => openItemsDialog(row) },
          { default: () => '管理项' }
        ),
        h(
          NButton,
          { size: 'small', quaternary: true, type: 'error', onClick: () => handleDelete(row) },
          { default: () => '删除' }
        )
      ])
  }
])

const itemColumns = computed<DataTableColumns<BackendDictItem>>(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 120, ellipsis: { tooltip: true } },
  { title: '字典项值', key: 'itemValue', width: 140, ellipsis: { tooltip: true } },
  { title: '字典项名称', key: 'itemLabel', width: 160, ellipsis: { tooltip: true } },
  {
    title: '启用状态',
    key: 'enabled',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: row.enabled === 1 ? 'success' : 'warning', size: 'small' },
        { default: () => (row.enabled === 1 ? '启用' : '禁用') }
      )
  },
  { title: '排序', key: 'sortOrder', width: 80 },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => formatTime(row.createTime)
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) =>
      h('div', { class: 'action-group' }, [
        h(
          NButton,
          { size: 'small', quaternary: true, type: 'primary', onClick: () => openItemDialog(row) },
          { default: () => '编辑' }
        ),
        h(
          NButton,
          { size: 'small', quaternary: true, type: 'error', onClick: () => handleItemDelete(row) },
          { default: () => '删除' }
        )
      ])
  }
])

const loadDicts = async () => {
  loading.value = true
  try {
    const result = await adminApi.getDictPage({
      pageNum: page.value,
      pageSize: pageSize.value,
      dictCode: filters.dictCode || undefined,
      dictName: filters.dictName || undefined,
      enabled: filters.enabled ?? undefined
    })
    dicts.value = result.records || []
    total.value = result.total || 0
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const loadItems = async () => {
  if (!currentDict.value?.dictCode) return
  itemsLoading.value = true
  try {
    items.value = await adminApi.getDictItems(currentDict.value.dictCode)
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    itemsLoading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadDicts()
}

const handleReset = () => {
  filters.dictCode = ''
  filters.dictName = ''
  filters.enabled = null
  page.value = 1
  loadDicts()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  page.value = 1
  loadDicts()
}

const handleSelectionChange = (keys: BackendId[]) => {
  selectedRowKeys.value = keys
}

const handleItemSelectionChange = (keys: BackendId[]) => {
  itemSelectedRowKeys.value = keys
}

const openDictDialog = (dict?: BackendDict) => {
  editingDict.value = dict || null
  Object.assign(dictForm, {
    dictCode: dict?.dictCode || '',
    dictName: dict?.dictName || '',
    description: dict?.description || '',
    enabled: dict?.enabled ?? 1,
    sortOrder: dict?.sortOrder ?? 0
  })
  showDictDialog.value = true
}

const openItemsDialog = (dict: BackendDict) => {
  currentDict.value = dict
  showItemsDialog.value = true
  itemSelectedRowKeys.value = []
  loadItems()
}

const openItemDialog = (item?: BackendDictItem) => {
  editingItem.value = item || null
  Object.assign(itemForm, {
    itemValue: item?.itemValue || '',
    itemLabel: item?.itemLabel || '',
    enabled: item?.enabled ?? 1,
    sortOrder: item?.sortOrder ?? 0,
    remark: item?.remark || ''
  })
  showItemDialog.value = true
}

const handleSaveDict = async () => {
  if (!dictForm.dictCode || !dictForm.dictCode.trim()) {
    message.warning('请输入字典编码')
    return
  }
  if (!dictForm.dictName || !dictForm.dictName.trim()) {
    message.warning('请输入字典名称')
    return
  }
  try {
    if (editingDict.value?.id) {
      await adminApi.updateDict(editingDict.value.id, dictForm)
      message.success('字典已更新')
    } else {
      await adminApi.createDict(dictForm)
      message.success('字典已创建')
    }
    showDictDialog.value = false
    loadDicts()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleDelete = async (dict: BackendDict) => {
  if (!dict.id) {
    message.warning('字典ID无效')
    return
  }
  if (!window.confirm('确认删除该字典吗？')) return
  try {
    await adminApi.deleteDict(dict.id)
    message.success('删除成功')
    loadDicts()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return
  if (!window.confirm(`确认删除选中的 ${selectedIds.value.length} 个字典吗？`)) return
  try {
    await adminApi.deleteDicts(selectedIds.value)
    message.success('批量删除成功')
    selectedRowKeys.value = []
    loadDicts()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleSaveItem = async () => {
  if (!currentDict.value?.dictCode) {
    message.warning('未选择字典')
    return
  }
  if (!itemForm.itemValue || !itemForm.itemValue.trim()) {
    message.warning('请输入字典项值')
    return
  }
  if (!itemForm.itemLabel || !itemForm.itemLabel.trim()) {
    message.warning('请输入字典项名称')
    return
  }
  try {
    if (editingItem.value?.id) {
      await adminApi.updateDictItem(editingItem.value.id, itemForm)
      message.success('字典项已更新')
    } else {
      await adminApi.createDictItem(currentDict.value.dictCode, itemForm)
      message.success('字典项已创建')
    }
    showItemDialog.value = false
    loadItems()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleItemDelete = async (item: BackendDictItem) => {
  if (!item.id) {
    message.warning('字典项ID无效')
    return
  }
  if (!window.confirm('确认删除该字典项吗？')) return
  try {
    await adminApi.deleteDictItem(item.id)
    message.success('删除成功')
    loadItems()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleItemBatchDelete = async () => {
  if (!selectedItemIds.value.length) return
  if (!window.confirm(`确认删除选中的 ${selectedItemIds.value.length} 个字典项吗？`)) return
  try {
    await adminApi.deleteDictItems(selectedItemIds.value)
    message.success('批量删除成功')
    itemSelectedRowKeys.value = []
    loadItems()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

onMounted(() => {
  loadDicts()
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
</style>
