<template>
  <div class="admin-view">
    <n-card>
      <n-space vertical :size="16">
        <n-space justify="space-between" align="center" :wrap="true">
          <n-space align="center" :wrap="true">
            <n-input v-model:value="filters.userName" placeholder="用户名" clearable style="width: 160px" />
            <n-input v-model:value="filters.email" placeholder="邮箱" clearable style="width: 180px" />
            <n-input v-model:value="filters.phone" placeholder="电话" clearable style="width: 140px" />
            <n-select
              v-model:value="filters.role"
              placeholder="角色"
              clearable
              style="width: 140px"
              :options="roleOptions"
            />
            <n-button type="primary" @click="handleSearch">查询</n-button>
            <n-button @click="handleReset">重置</n-button>
          </n-space>
          <n-space align="center">
            <n-button type="primary" @click="openCreateDialog">新建用户</n-button>
            <n-button type="error" :disabled="!selectedIds.length" @click="handleBatchDelete">
              批量删除
            </n-button>
          </n-space>
        </n-space>

        <n-space align="center" :wrap="true">
          <n-select
            v-model:value="batchRole"
            placeholder="批量角色"
            clearable
            style="width: 140px"
            :options="roleOptions"
          />
          <n-input v-model:value="batchAuthorization" placeholder="授权(可选)" style="width: 160px" />
          <n-button :disabled="!selectedIds.length" @click="handleBatchRole">批量设置角色</n-button>
          <n-text depth="3">已选 {{ selectedIds.length }} 条</n-text>
        </n-space>

        <n-data-table
          :columns="columns"
          :data="users"
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
            @update:page="loadUsers"
            @update:page-size="handlePageSizeChange"
          />
        </n-space>
      </n-space>
    </n-card>

    <n-modal v-model:show="showUserDialog" preset="dialog" :title="dialogTitle">
      <n-form :model="form">
        <n-form-item label="用户名">
          <n-input v-model:value="form.userName" placeholder="用户名" />
        </n-form-item>
        <n-form-item label="密码">
          <n-input v-model:value="form.password" type="password" placeholder="不修改可留空" />
        </n-form-item>
        <n-form-item label="昵称">
          <n-input v-model:value="form.nikeName" placeholder="昵称" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="form.email" placeholder="邮箱" />
        </n-form-item>
        <n-form-item label="电话">
          <n-input v-model:value="form.phone" placeholder="电话" />
        </n-form-item>
        <n-form-item label="性别">
          <n-input v-model:value="form.sex" placeholder="性别" />
        </n-form-item>
        <n-form-item label="角色">
          <n-select v-model:value="form.role" :options="roleOptions" />
        </n-form-item>
        <n-form-item label="授权">
          <n-input v-model:value="form.authorization" placeholder="授权" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showUserDialog = false">取消</n-button>
          <n-button type="primary" @click="handleSaveUser">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NTag, useMessage } from 'naive-ui'
import { adminApi, type AdminUserPayload } from '@/api/admin'
import type { BackendUser } from '@/types'
import { getErrorMessage } from '@/utils/error'

const message = useMessage()

const loading = ref(false)
const users = ref<BackendUser[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRowKeys = ref<Array<string | number>>([])

const filters = reactive({
  userName: '',
  email: '',
  phone: '',
  role: ''
})

const roleOptions = [
  { label: '用户', value: 'user' },
  { label: '管理员', value: 'manage' },
  { label: '超级管理员', value: 'admin' }
]

const batchRole = ref<string | null>(null)
const batchAuthorization = ref('')

const showUserDialog = ref(false)
const editingUser = ref<BackendUser | null>(null)
const form = reactive<AdminUserPayload>({
  userName: '',
  password: '',
  nikeName: '',
  email: '',
  phone: '',
  role: 'user',
  authorization: '',
  sex: ''
})

const dialogTitle = computed(() => (editingUser.value ? '编辑用户' : '新建用户'))

const rowKey = (row: BackendUser) => row.id ?? row.userName ?? row.username ?? ''

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

const columns = computed<DataTableColumns<BackendUser>>(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 140, ellipsis: { tooltip: true } },
  {
    title: '用户名',
    key: 'userName',
    ellipsis: { tooltip: true },
    render: (row) => row.userName || row.username || '-'
  },
  {
    title: '昵称',
    key: 'nikeName',
    render: (row) => row.nikeName || '-'
  },
  {
    title: '角色',
    key: 'role',
    render: (row) =>
      h(
        NTag,
        { type: row.role === 'admin' ? 'error' : row.role === 'manage' ? 'warning' : 'info', size: 'small' },
        { default: () => row.role || '-' }
      )
  },
  {
    title: '邮箱',
    key: 'email',
    render: (row) => row.email || '-'
  },
  {
    title: '电话',
    key: 'phone',
    render: (row) => row.phone || '-'
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 200,
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'nowrap' }, formatTime(row.createTime))
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) =>
      h('div', { class: 'action-group' }, [
        h(
          NButton,
          { size: 'small', quaternary: true, type: 'primary', onClick: () => openEditDialog(row) },
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

const loadUsers = async () => {
  loading.value = true
  try {
    const result = await adminApi.getUsersPage({
      pageNum: page.value,
      pageSize: pageSize.value,
      userName: filters.userName || undefined,
      email: filters.email || undefined,
      phone: filters.phone || undefined,
      role: filters.role || undefined
    })
    users.value = result.records || []
    total.value = result.total || 0
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadUsers()
}

const handleReset = () => {
  filters.userName = ''
  filters.email = ''
  filters.phone = ''
  filters.role = ''
  page.value = 1
  loadUsers()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  page.value = 1
  loadUsers()
}

const handleSelectionChange = (keys: Array<string | number>) => {
  selectedRowKeys.value = keys
}

const openCreateDialog = () => {
  editingUser.value = null
  Object.assign(form, {
    userName: '',
    password: '',
    nikeName: '',
    email: '',
    phone: '',
    role: 'user',
    authorization: '',
    sex: ''
  })
  showUserDialog.value = true
}

const openEditDialog = (user: BackendUser) => {
  editingUser.value = user
  Object.assign(form, {
    userName: user.userName || user.username || '',
    password: '',
    nikeName: user.nikeName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
    authorization: user.authorization || '',
    sex: ''
  })
  showUserDialog.value = true
}

const handleSaveUser = async () => {
  if (!form.userName || !form.userName.trim()) {
    message.warning('请输入用户名')
    return
  }
  if (!editingUser.value && (!form.password || !form.password.trim())) {
    message.warning('请输入密码')
    return
  }
  try {
    if (editingUser.value?.id) {
      await adminApi.updateUser(editingUser.value.id, form)
      message.success('用户已更新')
    } else {
      await adminApi.createUser(form)
      message.success('用户已创建')
    }
    showUserDialog.value = false
    loadUsers()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleDelete = async (user: BackendUser) => {
  const userId = user.id
  if (!userId) {
    message.warning('用户ID无效')
    return
  }
  if (!window.confirm('确认删除该用户吗？')) return
  try {
    await adminApi.deleteUser(userId)
    message.success('删除成功')
    loadUsers()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return
  if (!window.confirm(`确认删除选中的 ${selectedIds.value.length} 个用户吗？`)) return
  try {
    await adminApi.deleteUsers(selectedIds.value)
    message.success('批量删除成功')
    selectedRowKeys.value = []
    loadUsers()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleBatchRole = async () => {
  if (!selectedIds.value.length) {
    message.warning('请选择用户')
    return
  }
  if (!batchRole.value) {
    message.warning('请选择角色')
    return
  }
  try {
    await adminApi.updateUserRoles(selectedIds.value, batchRole.value, batchAuthorization.value || undefined)
    message.success('角色更新成功')
    loadUsers()
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

onMounted(() => {
  loadUsers()
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

.nowrap {
  white-space: nowrap;
}
</style>
